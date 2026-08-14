// ==UserScript==
// @name         视频代码翻转
// @namespace    https://github.com/0xsdeo/Hook_JS
// @version      2026-08-14
// @description  视频代码翻转，支持通过hook配置参数调节scale和rotate
// @author       0xsdeo
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_ID = 'flip_video';
    const BASE_KEY = `Antidebug_breaker_${SCRIPT_ID}`;

    function readConfig() {
        return {
            scale: parseFloat(localStorage.getItem(`${BASE_KEY}_value`)) || 1.5,
            rotate: parseInt(localStorage.getItem(`${BASE_KEY}_rotate`)) || 90
        };
    }

    /**
     * 翻转视频元素
     * @param {number} scale - 放大倍数
     * @param {number} rotate - 旋转角度（度）
     */
    function flipVideo(scale, rotate) {
        const video = document.querySelector('video');
        if (video) {
            video.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
            console.log(`[视频翻转] 已应用: scale(${scale}) rotate(${rotate}deg)`);
            console.log(`[视频翻转] video元素: ${video.tagName}, src=${video.currentSrc || '无'}`);
        } else {
            console.warn('[视频翻转] 未找到 video 元素');
        }
    }

    function applyFlip() {
        const config = readConfig();
        flipVideo(config.scale, config.rotate);
    }

    // 暴露到全局，方便在控制台直接调用
    window.flipVideo = function (scale, rotate) {
        scale = scale || 1.5;
        rotate = rotate || 90;
        localStorage.setItem(`${BASE_KEY}_value`, scale.toString());
        localStorage.setItem(`${BASE_KEY}_rotate`, rotate.toString());
        applyFlip();
    };

    console.log('[视频翻转] 脚本已加载，参数：scale=' + readConfig().scale + ', rotate=' + readConfig().rotate);
    console.log('[视频翻转] 当前 video 元素数量:', document.querySelectorAll('video').length);
    console.log('[视频翻转] 在控制台调用 window.flipVideo(1.3, 85) 可动态调整');

    // 监听 DOM 变化，当 video 元素出现时自动应用翻转
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === 'VIDEO') {
                        console.log('[视频翻转] 检测到新增 VIDEO 元素，自动应用翻转');
                        applyFlip();
                        return;
                    }
                    if (node.querySelector) {
                        const video = node.querySelector('video');
                        if (video) {
                            console.log('[视频翻转] 检测到新插入的 video 元素，自动应用翻转');
                            applyFlip();
                            return;
                        }
                    }
                }
            }
        }
    });

    console.log('[视频翻转] MutationObserver 已启动，监听 video 元素变化');
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // 页面加载完成后立即尝试翻转已有的 video
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[视频翻转] DOMContentLoaded 触发，执行翻转');
            applyFlip();
        });
    } else {
        console.log('[视频翻转] DOM 已加载完成，立即执行翻转');
        applyFlip();
    }

    // 监听配置变更事件（来自 content.js 的 HOOK_CONFIG_READY）
    window.addEventListener('message', function (event) {
        if (event.source !== window || !event.data || event.data.source !== 'antidebug-extension') return;
        if (event.data.type === 'HOOK_CONFIG_READY' && (event.data.scriptIds || []).includes(SCRIPT_ID)) {
            console.log('[视频翻转] 收到配置就绪事件，重新应用翻转');
            applyFlip();
        }
    });
})();
