// 在document_start阶段执行
(() => {
    // 简易 logger
    const logger = {
        info: (...args) => console.log('[AntiDebug]', ...args),
        warn: (...args) => console.warn('[AntiDebug]', ...args),
        error: (...args) => console.error('[AntiDebug]', ...args)
    };
    // 🆕 Hook板块：在脚本注入前设置localStorage（必须在最顶部）
    try {
        const hostname = window.location.hostname;
        logger.info('[AntiDebug] content.js 开始同步 Hook 配置到 localStorage, hostname=%s', hostname);
        chrome.storage.local.get([hostname, 'antidebug_mode', 'global_scripts'], (result) => {
            // 判断是全局模式还是标准模式
            const mode = result['antidebug_mode'] || 'standard';
            let enabledScripts = [];

            if (mode === 'global') {
                enabledScripts = result['global_scripts'] || [];
            } else {
                enabledScripts = result[hostname] || [];
            }

            logger.info('[AntiDebug] Hook 配置同步模式=%s, 启用脚本数量=%d', mode, enabledScripts.length);

            // 遍历所有启用的脚本，检查是否有Hook配置（有配置的就是Hook脚本）
            if (enabledScripts.length > 0) {
                const configKeys = enabledScripts.map(id => `${id}_config`);
                chrome.storage.local.get(configKeys, (configResult) => {
                    const hookScriptsReady = [];

                    enabledScripts.forEach(scriptId => {
                        const config = configResult[`${scriptId}_config`];
                        // 只同步有配置的脚本（Hook脚本才会有配置）
                        if (config) {
                            const baseKey = `Antidebug_breaker_${scriptId}`;

                            try {
                                // 固定变量脚本
                                if (config.value !== undefined) {
                                    localStorage.setItem(`${baseKey}_value`, config.value);
                                }

                                // 非固定变量脚本
                                if (config.flag !== undefined) {
                                    localStorage.setItem(`${baseKey}_flag`, config.flag.toString());
                                }
                                if (config.param !== undefined) {
                                    localStorage.setItem(`${baseKey}_param`, JSON.stringify(config.param));
                                }
                                // 额外参数（如 rotate）
                                if (config.rotate !== undefined) {
                                    localStorage.setItem(`${baseKey}_rotate`, config.rotate.toString());
                                }

                                // 动态开关（debugger, stack等）
                                Object.keys(config).forEach(key => {
                                    // 🔧 修改：排除 keyword_filter_enabled，它只是插件UI的控制开关，不需要同步到页面
                                    if (!['value', 'flag', 'param', 'keyword_filter_enabled'].includes(key)) {
                                        localStorage.setItem(`${baseKey}_${key}`, (config[key] || 0).toString());
                                    }
                                });

                                // 记录已就绪的Hook脚本
                                hookScriptsReady.push(scriptId);
                                logger.info('[AntiDebug] Hook脚本配置已同步, scriptId=%s', scriptId);
                            } catch (e) {
                                console.warn(`[AntiDebug] Failed to set localStorage for ${scriptId}:`, e);
                            }
                        }
                    });

                    // 🔧 方案二：配置设置完成后，通知所有Hook脚本配置已就绪
                    if (hookScriptsReady.length > 0) {
                        logger.info('[AntiDebug] 所有Hook脚本配置已就绪, 共%d个, 发送 HOOK_CONFIG_READY 事件', hookScriptsReady.length);
                        // 发送通知到页面主世界，告知Hook脚本配置已就绪
                        window.postMessage({
                            type: 'HOOK_CONFIG_READY',
                            source: 'antidebug-extension',
                            scriptIds: hookScriptsReady
                        }, '*');
                    }
                });
            } else {
                logger.info('[AntiDebug] 当前页面无启用的Hook脚本，跳过配置同步');
            }
        });
    } catch (e) {
        console.warn('[AntiDebug] Failed to sync Hook config to localStorage', e);
    }

    // 🆕 应用 Hook 配置并触发页面脚本执行
    function applyHookConfig(scriptId, config) {
        const baseKey = `Antidebug_breaker_${scriptId}`;
        if (config.value !== undefined) localStorage.setItem(`${baseKey}_value`, String(config.value));
        if (config.rotate !== undefined) localStorage.setItem(`${baseKey}_rotate`, String(config.rotate));
        if (config.flag !== undefined) localStorage.setItem(`${baseKey}_flag`, String(config.flag));
        if (config.param !== undefined) localStorage.setItem(`${baseKey}_param`, JSON.stringify(config.param));

        // 发送 HOOK_CONFIG_READY 事件通知页面脚本
        window.postMessage({
            type: 'HOOK_CONFIG_READY',
            source: 'antidebug-extension',
            scriptIds: [scriptId]
        }, '*');
    }

    // 优先从本地存储获取启用状态
    const getEnabledScripts = () => {
        try {
            const hostname = window.location.hostname;
            const storageData = localStorage.getItem('AntiDebug_Breaker');
            if (storageData) {
                const parsed = JSON.parse(storageData);
                const scripts = parsed[hostname] || [];
                logger.info('[AntiDebug] getEnabledScripts 从 localStorage 读取脚本列表, hostname=%s, count=%d', hostname, scripts.length);
                return scripts;
            }
            logger.info('[AntiDebug] getEnabledScripts localStorage 中无 AntiDebug_Breaker 数据');
        } catch (e) {
            console.warn('[AntiDebug] Failed to read localStorage', e);
        }
        return [];
    };

    // 从扩展存储获取最新状态
    const hostname = window.location.hostname;
    chrome.storage.local.get([hostname], (result) => {
        const latestEnabledScripts = result[hostname] || [];
        logger.info('[AntiDebug] 从 chrome.storage 获取最新脚本列表, hostname=%s, count=%d', hostname, latestEnabledScripts.length);

        // 更新本地存储
        try {
            const storageData = localStorage.getItem('AntiDebug_Breaker') || '{}';
            const parsed = JSON.parse(storageData);
            parsed[hostname] = latestEnabledScripts.filter(
                id => typeof id === 'string' && id.trim() !== ''
            );
            localStorage.setItem('AntiDebug_Breaker', JSON.stringify(parsed));
            logger.info('[AntiDebug] 已更新 localStorage, hostname=%s', hostname);
        } catch (e) {
            console.warn('[AntiDebug] Failed to update localStorage', e);
        }
    });

    // 监听来自popup的更新
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'scripts_updated' && message.hostname === hostname) {
            logger.info('[AntiDebug] 收到 scripts_updated 消息, hostname=%s, enabledScripts=%o', message.hostname, message.enabledScripts);
            // 更新本地存储
            try {
                const storageData = localStorage.getItem('AntiDebug_Breaker') || '{}';
                const parsed = JSON.parse(storageData);
                parsed[hostname] = message.enabledScripts;
                localStorage.setItem('AntiDebug_Breaker', JSON.stringify(parsed));
                logger.info('[AntiDebug] 已根据 scripts_updated 更新 localStorage, hostname=%s', hostname);
            } catch (e) {
                console.warn('[AntiDebug] Failed to update localStorage', e);
            }
        }

        // 监听popup请求Vue数据
        if (message.type === 'REQUEST_VUE_ROUTER_DATA') {
            logger.info('[AntiDebug] 收到 REQUEST_VUE_ROUTER_DATA 消息，转发到页面脚本');
            // 转发请求到页面脚本
            window.postMessage({
                type: 'REQUEST_VUE_ROUTER_DATA',
                source: 'antidebug-extension'
            }, '*');
            sendResponse({success: true});
            return true;
        }

        // 🆕 接收 popup 发送的 Hook 配置应用消息，实现即时生效
        if (message.type === 'HOOK_CONFIG_APPLY') {
            logger.info('[AntiDebug] 收到 HOOK_CONFIG_APPLY, scriptId=%s', message.scriptId);
            applyHookConfig(message.scriptId, message.config);
            sendResponse({ success: true });
            return true;
        }

        // 🆕 监听popup触发Vue重扫描请求
        if (message.type === 'TRIGGER_VUE_RESCAN') {
            logger.info('[AntiDebug] 收到 TRIGGER_VUE_RESCAN 消息，转发到页面脚本');
            // 转发重扫描请求到页面脚本
            window.postMessage({
                type: 'MANUAL_RESCAN_VUE',
                source: 'antidebug-extension'
            }, '*');
            sendResponse({success: true});
            return true;
        }

        return true;
    });

    // 监听来自页面脚本的 Vue Router 数据
    window.addEventListener('message', (event) => {
        // 只接受来自同一窗口的消息
        if (event.source !== window) return;

        // 检查消息类型
        if (event.data && event.data.type === 'VUE_ROUTER_DATA' && event.data.source === 'get-vue-script') {
            logger.info('[AntiDebug] 收到 VUE_ROUTER_DATA 消息，路由条数=%d，转发到 background', (event.data.data && event.data.data.routes ? event.data.data.routes.length : 0));
            // 转发到 background/popup
            chrome.runtime.sendMessage({
                type: 'VUE_ROUTER_DATA',
                data: event.data.data
            }).catch(err => {
                logger.warn('[AntiDebug] 转发 VUE_ROUTER_DATA 到 background 失败: %s', err && err.message ? err.message : err);
            });
        }
    });
})();
