/**
 * AntiDebug Breaker - 全局请求头注入脚本
 * 通过 Hook XMLHttpRequest 和 Fetch API 来自动添加自定义请求头
 */

(function() {
    'use strict';
    
    const sone_color = "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );font-size:2em;";

    // 从 localStorage 读取全局请求头配置
    const STORAGE_KEY = 'AntiDebug_Breaker_GlobalHeaders';
    
    // 获取要注入的请求头
    function getGlobalHeaders() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const headers = JSON.parse(data);
                logger.info('[AntiDebug] 读取全局请求头配置成功, count=%d', headers.length);
                return headers;
            }
            logger.info('[AntiDebug] 全局请求头配置为空，无注入项');
        } catch (e) {
            logger.warn('[AntiDebug] 读取全局请求头配置失败: %s', e && e.message ? e.message : e);
        }
        return [];
    }
    
    // ========== Hook XMLHttpRequest ==========
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        // 标记此请求需要注入头
        this._antidebug_needs_headers = true;
        this._antidebug_headers_set = {};
        return originalXHROpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        // 记录已设置的请求头
        if (this._antidebug_headers_set) {
            this._antidebug_headers_set[name.toLowerCase()] = true;
        }
        return originalXHRSetRequestHeader.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
        // 在发送前注入全局请求头
        if (this._antidebug_needs_headers) {
            const globalHeaders = getGlobalHeaders();
            let injectedCount = 0;
            globalHeaders.forEach(header => {
                if (header.name && header.name.trim()) {
                    // 只有当请求没有设置该头时才注入
                    const headerKey = header.name.toLowerCase();
                    if (!this._antidebug_headers_set || !this._antidebug_headers_set[headerKey]) {
                        try {
                            originalXHRSetRequestHeader.call(this, header.name, header.value || '');
                            injectedCount++;
                        } catch (e) {
                            logger.warn('[AntiDebug] XHR 请求头注入失败, header=%s: %s', header.name, e && e.message ? e.message : e);
                        }
                    }
                }
            });
            if (injectedCount > 0) {
                logger.info('[AntiDebug] XHR 请求注入完成, 注入头数=%d', injectedCount);
            }
        }
        return originalXHRSend.apply(this, arguments);
    };
    
    // ========== Hook Fetch API ==========
    const originalFetch = window.fetch;

    window.fetch = function(input, init) {
        const globalHeaders = getGlobalHeaders();

        if (globalHeaders.length > 0) {
            // 创建新的 init 对象
            init = init || {};

            // 处理 headers
            let headers;
            if (init.headers instanceof Headers) {
                headers = new Headers(init.headers);
            } else if (typeof init.headers === 'object') {
                headers = new Headers(init.headers);
            } else {
                headers = new Headers();
            }

            // 注入全局请求头
            let injectedCount = 0;
            globalHeaders.forEach(header => {
                if (header.name && header.name.trim()) {
                    // 只有当请求没有设置该头时才注入
                    if (!headers.has(header.name)) {
                        try {
                            headers.set(header.name, header.value || '');
                            injectedCount++;
                        } catch (e) {
                            logger.warn('[AntiDebug] Fetch 请求头注入失败, header=%s: %s', header.name, e && e.message ? e.message : e);
                        }
                    }
                }
            });

            init.headers = headers;
            logger.info('[AntiDebug] Fetch 请求注入完成, url=%s, 注入头数=%d', typeof input === 'string' ? input : (input && input.url ? input.url : String(input)), injectedCount);
        }

        return originalFetch.apply(this, [input, init]);
    };
    
    // 输出日志
    console.log("%c[AntiDebug] 全局请求头注入脚本已加载", sone_color);
    
    // 监听 storage 变化，实时更新
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            console.log("%c[AntiDebug] 全局请求头配置已更新", sone_color);
        }
    });
})();
