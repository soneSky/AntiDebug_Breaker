// ====== MCP 客户端集成 ====== //
importScripts('mcp-client.js');

// ====== 脚本注册管理 ====== //
const scriptRegistry = new Map(); // 存储: [hostname|scriptId] => 注册ID
let isInitialized = false;

// 🆕 全局模式存储键名
const GLOBAL_MODE_KEY = 'antidebug_mode';
const GLOBAL_SCRIPTS_KEY = 'global_scripts';

// 🆕 全局请求头存储键名
const HEADERS_ENABLED_KEY = 'global_headers_enabled';

// 生成全局唯一ID
function generateUniqueId() {
    return `ad_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// 🔧 新增：清理指定模式的所有脚本注册
async function clearModeScripts(isGlobalMode) {
    const keysToRemove = [];
    const keyPrefix = isGlobalMode ? 'global' : '';
    
    for (const [key, regId] of scriptRegistry) {
        if (isGlobalMode) {
            // 清理全局模式：移除所有以"global|"开头的键
            if (key.startsWith('global|')) {
                keysToRemove.push(key);
            }
        } else {
            // 清理标准模式：移除所有不以"global|"开头的键（即域名键）
            if (!key.startsWith('global|') && key.includes('|')) {
                keysToRemove.push(key);
            }
        }
    }

    if (keysToRemove.length > 0) {
        const removeIds = keysToRemove.map(key => scriptRegistry.get(key));

        try {
            await chrome.scripting.unregisterContentScripts({
                ids: removeIds
            });
            console.log(`[AntiDebug] Cleared ${isGlobalMode ? 'global' : 'standard'} mode scripts:`, keysToRemove);

            // 清理注册表
            keysToRemove.forEach(key => scriptRegistry.delete(key));
        } catch (error) {
            if (!error.message.includes('Nonexistent')) {
                console.error('[AntiDebug] Failed to clear mode scripts:', error);
            }
        }
    }
}

// 🆕 注册脚本到主世界（支持全局模式）
async function registerScripts(hostname, scriptIds, isGlobalMode = false) {
    // 🆕 全局模式允许特殊的hostname值
    if (!isGlobalMode) {
        // 标准模式：检查hostname是否有效
        if (!hostname || typeof hostname !== 'string' || hostname.trim() === '' || !hostname.includes('.')) {
            console.warn('[AntiDebug] registerScripts 跳过: 无效hostname', hostname);
            return;
        }
    }

    // 过滤有效脚本ID
    const validScriptIds = scriptIds.filter(
        id => typeof id === 'string' && id.trim() !== ''
    );

    // 🆕 创建当前应存在的键集合（支持全局模式）
    const currentKeys = new Set();
    const keyPrefix = isGlobalMode ? 'global' : hostname;
    validScriptIds.forEach(id => {
        currentKeys.add(`${keyPrefix}|${id}`);
    });

    console.log(`[AntiDebug] registerScripts 开始, hostname=${hostname}, isGlobalMode=${isGlobalMode}, scriptIds=${validScriptIds.length}, keyPrefix=${keyPrefix}`);

    // === 1. 注销不再需要的脚本 ===
    const keysToRemove = [];
    for (const [key, regId] of scriptRegistry) {
        if (key.startsWith(`${keyPrefix}|`) && !currentKeys.has(key)) {
            keysToRemove.push(key);
        }
    }

    if (keysToRemove.length > 0) {
        const removeIds = keysToRemove.map(key => scriptRegistry.get(key));
        console.log(`[AntiDebug] registerScripts 注销旧脚本, 待移除=${keysToRemove.length}:`, keysToRemove);

        try {
            await chrome.scripting.unregisterContentScripts({
                ids: removeIds
            });
            console.log(`[AntiDebug] registerScripts 注销成功, 脚本IDs:`, removeIds);

            // 清理注册表
            keysToRemove.forEach(key => scriptRegistry.delete(key));
        } catch (error) {
            console.error(`[AntiDebug] registerScripts 注销失败:`, error.message, error.stack);
        }
    } else {
        console.log('[AntiDebug] registerScripts 无需注销脚本');
    }

    // === 2. 注册新脚本 ===
    const scriptsToRegister = [];

    validScriptIds.forEach(id => {
        const key = `${keyPrefix}|${id}`;

        // 如果尚未注册，则创建新注册项
        if (!scriptRegistry.has(key)) {
            const regId = generateUniqueId();
            scriptRegistry.set(key, regId);

            // 🆕 根据模式设置matches
            const matches = isGlobalMode ? ['<all_urls>'] : [`*://${hostname}/*`];

            scriptsToRegister.push({
                id: regId,
                js: [`scripts/${id}.js`],
                matches: matches,
                runAt: 'document_start',
                world: 'MAIN'
            });
        }
    });

    if (scriptsToRegister.length > 0) {
        console.log(`[AntiDebug] registerScripts 注册新脚本, 数量=${scriptsToRegister.length}:`, scriptsToRegister.map(s => s.id));
        try {
            await chrome.scripting.registerContentScripts(scriptsToRegister);
            console.log(`[AntiDebug] registerScripts 注册成功`);
        } catch (error) {
            console.error(`[AntiDebug] registerScripts 注册失败:`, error.message, error.stack);
        }
    } else {
        console.log('[AntiDebug] registerScripts 无新脚本需要注册');
    }
}

// 初始化时清除所有旧注册
async function initializeScriptRegistry() {
    if (isInitialized) {
        console.log('[AntiDebug] initializeScriptRegistry 已初始化，跳过');
        return;
    }

    console.log('[AntiDebug] initializeScriptRegistry 开始初始化');
    try {
        // 清除所有旧注册
        const registered = await chrome.scripting.getRegisteredContentScripts();
        const ourScripts = registered.filter(script => script.id.startsWith('ad_'));

        if (ourScripts.length > 0) {
            await chrome.scripting.unregisterContentScripts({
                ids: ourScripts.map(s => s.id)
            });
            console.log(`[AntiDebug] initializeScriptRegistry 清除旧注册, 数量=${ourScripts.length}`);
        } else {
            console.log('[AntiDebug] initializeScriptRegistry 无旧注册需要清除');
        }

        isInitialized = true;
        console.log('[AntiDebug] initializeScriptRegistry 完成');
    } catch (error) {
        console.error('[AntiDebug] initializeScriptRegistry 失败:', error.message, error.stack);
    }
}

// ====== 初始化及原有徽章管理 ====== //
chrome.runtime.onStartup.addListener(initializeScriptRegistry);
chrome.runtime.onInstalled.addListener(initializeScriptRegistry);

chrome.storage.local.get(null, (data) => {
    // 先初始化注册表
    initializeScriptRegistry().then(() => {
        // 🆕 检查全局模式并初始化全局脚本
        const mode = data[GLOBAL_MODE_KEY] || 'standard';
        const globalScripts = data[GLOBAL_SCRIPTS_KEY] || [];
        
        if (mode === 'global' && globalScripts.length > 0) {
            // 全局模式：注册全局脚本
            registerScripts('*', globalScripts, true);
        }
        
        // 初始化存储结构
        Object.keys(data).forEach(hostname => {
            if (Array.isArray(data[hostname]) && hostname.includes('.')) {
                // 确保计数基于有效的脚本ID
                const validCount = data[hostname].filter(
                    id => typeof id === 'string' && id.trim() !== ''
                ).length;

                updateBadgeForHostname(hostname, validCount);

                // 🆕 只在标准模式下初始化脚本注册
                if (mode === 'standard') {
                    registerScripts(hostname, data[hostname], false);
                }
            }
        });
    });
});

// 监听存储变化并同步
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    console.log('[AntiDebug] storage.onChanged 触发, 变更keys:', Object.keys(changes));
    for (let [key, {newValue, oldValue}] of Object.entries(changes)) {
        if (namespace === 'local') {
            console.log(`[AntiDebug] 存储变化: key=${key}, oldValue=${JSON.stringify(oldValue).substring(0, 80)}, newValue=${JSON.stringify(newValue).substring(0, 80)}`);

            // 🆕 处理全局模式变化
            if (key === GLOBAL_MODE_KEY) {
                console.log(`[AntiDebug] 模式切换: ${oldValue} → ${newValue}`);
                // 模式切换时重新初始化所有脚本
                // 这里可以根据需要添加更多逻辑
                continue;
            }

            // 🆕 处理全局脚本变化
            if (key === GLOBAL_SCRIPTS_KEY && Array.isArray(newValue)) {
                console.log(`[AntiDebug] 全局脚本变化, 数量=${newValue.length}`);
                // 更新全局脚本注册
                await registerScripts('*', newValue, true);
                continue;
            }

            if (Array.isArray(newValue) && key.includes('.')) {
                console.log(`[AntiDebug] 域名脚本变化: ${key}, 数量=${newValue.length}`);
                // 更新标准模式脚本注册
                await registerScripts(key, newValue, false);

                // 同步到所有标签页的localStorage
                chrome.tabs.query({}, (tabs) => {
                    let matchedCount = 0;
                    tabs.forEach(tab => {
                        if (tab.url) {
                            try {
                                const tabHostname = new URL(tab.url).hostname;
                                if (tabHostname === key) {
                                    matchedCount++;
                                    chrome.scripting.executeScript({
                                        target: {tabId: tab.id},
                                        func: (hostname, scripts) => {
                                            try {
                                                const storageData = localStorage.getItem('AntiDebug_Breaker') || '{}';
                                                const parsed = JSON.parse(storageData);
                                                parsed[hostname] = scripts;
                                                localStorage.setItem('AntiDebug_Breaker', JSON.stringify(parsed));
                                                console.log('[AntiDebug] content localStorage同步成功, hostname=' + hostname);
                                            } catch (e) {
                                                console.warn('[AntiDebug] localStorage同步失败:', e);
                                            }
                                        },
                                        args: [key, newValue]
                                    });
                                }
                            } catch (e) {
                                console.warn('[AntiDebug] URL解析失败:', e);
                            }
                        }
                    });
                    console.log(`[AntiDebug] 同步localStorage到 ${matchedCount} 个标签页`);
                });
            }
        }
    }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[AntiDebug] 收到消息: type=${message.type}, sender=${sender ? sender.tabId : 'none'}`);

    // 🔧 新增：处理清理旧模式脚本的请求
    if (message.type === 'clear_mode_scripts') {
        console.log(`[AntiDebug] clear_mode_scripts 请求, clearGlobalMode=${message.clearGlobalMode}`);
        clearModeScripts(message.clearGlobalMode);
        sendResponse({success: true});
        return true;
    }

    // 🆕 处理全局请求头更新
    if (message.type === 'UPDATE_GLOBAL_HEADERS') {
        console.log(`[AntiDebug] UPDATE_GLOBAL_HEADERS 收到, headers数量=${message.headers ? message.headers.length : 0}`);
        updateGlobalHeaders(message.headers);
        // 更新扩展图标徽章显示请求头数量
        updateHeadersBadge(message.headers ? message.headers.length : 0);
        sendResponse({success: true});
        return true;
    }

    // 🆕 处理脚本注册更新请求（支持全局模式）
    if (message.type === 'update_scripts_registration') {
        const isGlobalMode = message.isGlobalMode || false;
        const hostname = message.hostname;
        const enabledScripts = message.enabledScripts;
        console.log(`[AntiDebug] update_scripts_registration, isGlobalMode=${isGlobalMode}, hostname=${hostname}, scripts=${enabledScripts ? enabledScripts.length : 0}`);

        registerScripts(hostname, enabledScripts, isGlobalMode);
        sendResponse({success: true});
        return true;
    }

    // 处理 Vue Router 数据
    if (message.type === 'VUE_ROUTER_DATA' && sender.tab) {
        try {
            const hostname = new URL(sender.tab.url).hostname;
            const storageKey = `${hostname}_vue_data`;

            console.log(`[AntiDebug] VUE_ROUTER_DATA 收到, hostname=${hostname}, routes=${message.data ? message.data.routes ? message.data.routes.length : 'unknown' : 'none'}`);

            // 存储 Vue Router 数据
            chrome.storage.local.set({
                [storageKey]: {
                    ...message.data,
                    timestamp: Date.now()
                }
            });

            // 转发给所有打开的popup（如果有的话）
            chrome.runtime.sendMessage({
                type: 'VUE_ROUTER_DATA_UPDATE',
                hostname: hostname,
                data: message.data
            }).catch(() => {
                // popup未打开，忽略错误
            });
        } catch (e) {
            console.error('[AntiDebug] VUE_ROUTER_DATA 处理失败:', e);
        }

        sendResponse({success: true});
        return true;
    }

    console.log(`[AntiDebug] 未处理的消息类型: ${message.type}`);
    return true;
});

// 监听标签切换事件
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            updateBadgeForTab(tab);
        }
    });
});

// 监听标签URL变化 - 关键修改：只在页面加载完成后更新徽章
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 只在页面加载完成后更新徽章
    if (changeInfo.status === 'complete') {
        updateBadgeForTab(tab);
    }
    
    // 当页面开始加载时，清除旧的 Vue Router 数据
    if (changeInfo.status === 'loading' && tab.url) {
        try {
            const hostname = new URL(tab.url).hostname;
            const storageKey = `${hostname}_vue_data`;
            chrome.storage.local.remove(storageKey);
        } catch (e) {
            // 忽略错误
        }
    }
});

// 处理消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'tab_updated') {
        updateBadgeForTab(message.tab);
    }

    // 🆕 Hook 配置即时生效：向页面注入脚本设置 localStorage 并触发翻转
    if (message.type === 'APPLY_HOOK_CONFIG') {
        const { scriptId, config } = message;
        const tabId = sender.tab ? sender.tab.id : null;
        if (!tabId) return;

        const baseKey = `Antidebug_breaker_${scriptId}`;
        const kvPairs = {};
        if (config.value !== undefined) kvPairs[`${baseKey}_value`] = String(config.value);
        if (config.rotate !== undefined) kvPairs[`${baseKey}_rotate`] = String(config.rotate);
        if (config.flag !== undefined) kvPairs[`${baseKey}_flag`] = String(config.flag);
        if (config.param !== undefined) kvPairs[`${baseKey}_param`] = JSON.stringify(config.param);
        Object.keys(config).forEach(key => {
            if (!['value', 'flag', 'param', 'keyword_filter_enabled'].includes(key)) {
                kvPairs[`${baseKey}_${key}`] = String(config[key] || 0);
            }
        });

        chrome.scripting.executeScript({
            target: { tabId },
            func: (kvPairs) => {
                try {
                    Object.entries(kvPairs).forEach(([k, v]) => localStorage.setItem(k, v));
                    window.postMessage({
                        type: 'HOOK_CONFIG_READY',
                        source: 'antidebug-extension',
                        scriptIds: [scriptId]
                    }, '*');
                } catch (e) {}
            },
            args: [kvPairs]
        });
        sendResponse({ success: true });
        return true;
    }
});

// 🆕 更新标签页徽章（支持全局模式）
function updateBadgeForTab(tab) {
    if (!tab.url) return;

    try {
        // 🆕 获取全局模式状态
        chrome.storage.local.get([GLOBAL_MODE_KEY, GLOBAL_SCRIPTS_KEY], (result) => {
            const mode = result[GLOBAL_MODE_KEY] || 'standard';
            
            if (mode === 'global') {
                // 全局模式：显示全局脚本数量
                const globalScripts = result[GLOBAL_SCRIPTS_KEY] || [];
                const validCount = globalScripts.filter(
                    id => typeof id === 'string' && id.trim() !== ''
                ).length;
                updateBadge(tab.id, validCount);
            } else {
                // 标准模式：显示当前域名脚本数量
                const hostname = new URL(tab.url).hostname;
                chrome.storage.local.get([hostname], (domainResult) => {
                    const enabledScripts = domainResult[hostname] || [];
                    const validCount = enabledScripts.filter(
                        id => typeof id === 'string' && id.trim() !== ''
                    ).length;
                    updateBadge(tab.id, validCount);
                });
            }
        });
    } catch (error) {
        console.error('Error updating badge for tab:', tab, error);
    }
}

// 更新特定域名的徽章
function updateBadgeForHostname(hostname, count) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url) {
                try {
                    const tabHostname = new URL(tab.url).hostname;
                    if (tabHostname === hostname) {
                        updateBadge(tab.id, count);
                    }
                } catch (e) {
                    // 忽略URL解析错误
                }
            }
        });
    });
}

// 🆕 全局请求头数量缓存
let globalHeadersCount = 0;

// 设置徽章文本（脚本数量 + 请求头数量）
function updateBadge(tabId, scriptCount) {
    const totalCount = scriptCount + globalHeadersCount;
    console.log('[AntiDebug] updateBadge: tabId=', tabId, ', scriptCount=', scriptCount, ', globalHeadersCount=', globalHeadersCount, ', total=', totalCount);
    if (totalCount > 0) {
        chrome.action.setBadgeText({text: totalCount.toString(), tabId});
        // 如果有请求头用绿色，否则用蓝色
        const color = globalHeadersCount > 0 ? '#00c853' : '#4688F1';
        chrome.action.setBadgeBackgroundColor({color: color, tabId});
    } else {
        chrome.action.setBadgeText({text: '', tabId});
    }
}

// 🆕 更新全局请求头徽章
function updateHeadersBadge(count) {
    globalHeadersCount = count;
    console.log('[AntiDebug] 更新请求头徽章, 数量:', count, ', globalHeadersCount:', globalHeadersCount);
    
    // 更新所有标签页的徽章
    chrome.tabs.query({}, (tabs) => {
        console.log('[AntiDebug] 更新', tabs.length, '个标签页的徽章');
        tabs.forEach(tab => {
            if (tab.url) {
                updateBadgeForTab(tab);
            }
        });
    });
}

// 🆕 更新全局请求头 - 双重方案：declarativeNetRequest + content script hook
async function updateGlobalHeaders(headers) {
    const hasHeaders = headers && headers.length > 0;

    console.log(`[AntiDebug] updateGlobalHeaders 被调用, headers数量=${headers ? headers.length : 0}, hasHeaders=${hasHeaders}`);
    if (hasHeaders) {
        headers.forEach((h, i) => console.log(`[AntiDebug]   header[${i}]: name=${h.name}, value=${(h.value || '').substring(0, 60)}`));
    }

    // 使用 declarativeNetRequest API（和 ModHeader 一样）
    try {
        // 先移除所有旧规则
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);

        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
            console.log(`[AntiDebug] updateGlobalHeaders 已移除旧规则, 数量=${ruleIdsToRemove.length}`);
        }

        if (hasHeaders) {
            const validHeaders = headers.filter(h => h.name && h.name.trim());

            if (validHeaders.length > 0) {
                // 为每个请求头创建操作
                const requestHeaders = validHeaders.map(h => ({
                    header: h.name.trim(),
                    operation: 'set',
                    value: h.value || ''
                }));

                // 使用正确的规则格式
                const rules = [{
                    id: 1,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: requestHeaders
                    },
                    condition: {
                        // 匹配所有 http 和 https URL
                        regexFilter: '.*',
                        resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other']
                    }
                }];

                console.log(`[AntiDebug] updateGlobalHeaders 添加规则, 请求头数=${requestHeaders.length}`);
                requestHeaders.forEach((rh, i) => console.log(`[AntiDebug]   rule header[${i}]: ${rh.header} = ${(rh.value || '').substring(0, 60)}`));

                await chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: rules
                });

                // 验证规则是否添加成功
                const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
                console.log(`[AntiDebug] ✅ updateGlobalHeaders 完成, 当前活动规则数量=${currentRules.length}`);
            } else {
                console.warn('[AntiDebug] updateGlobalHeaders 无有效请求头（name为空）');
            }
        } else {
            console.log('[AntiDebug] updateGlobalHeaders 无请求头，已清除所有规则');
        }
    } catch (error) {
        console.error(`[AntiDebug] ❌ updateGlobalHeaders 失败:`, error.message, error.stack);
    }
}

// 🆕 初始化时加载全局请求头配置（只使用当前选中组）
async function initGlobalHeaders() {
    try {
        console.log('[AntiDebug] initGlobalHeaders 开始');
        const result = await chrome.storage.local.get(['global_headers_groups', 'global_headers_data', 'current_headers_group']);
        const data = result.global_headers_data || {};
        const currentGroupId = result.current_headers_group;

        console.log(`[AntiDebug] initGlobalHeaders 数据: groups数=${Object.keys(data).length}, currentGroupId=${currentGroupId}`);

        // 只收集当前选中组的启用请求头
        const enabledHeaders = [];

        if (currentGroupId && data[currentGroupId]) {
            const items = data[currentGroupId] || [];
            console.log(`[AntiDebug] initGlobalHeaders 当前组${currentGroupId}有${items.length}个请求头`);
            items.forEach(item => {
                if (item.enabled && item.name && item.name.trim()) {
                    enabledHeaders.push({
                        name: item.name.trim(),
                        value: item.value || ''
                    });
                    console.log(`[AntiDebug]   启用: ${item.name} = ${(item.value || '').substring(0, 60)}`);
                } else {
                    console.log(`[AntiDebug]   跳过: ${item.name} (enabled=${item.enabled})`);
                }
            });
        } else {
            console.log('[AntiDebug] initGlobalHeaders 当前无选中组或组数据为空');
        }

        // 无论有无请求头都更新规则（确保清理旧规则）
        await updateGlobalHeaders(enabledHeaders);

        // 更新图标徽章
        updateHeadersBadge(enabledHeaders.length);
        console.log(`[AntiDebug] initGlobalHeaders 完成, 启用请求头数=${enabledHeaders.length}`);
    } catch (error) {
        console.error('[AntiDebug] initGlobalHeaders 失败:', error.message, error.stack);
    }
}

// 在初始化时调用
initGlobalHeaders();
