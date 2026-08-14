// ==UserScript==
// @name         hook_localStorage
// @namespace    https://github.com/0xsdeo/Hook_JS
// @version      2025-02-17
// @description  hook localStorage all methods
// @author       0xsdeo
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_ID = 'hook_localStorage_setItem';

    const sone_color = "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );font-size:2em;";

    function clear_Antidebug(id) {
        localStorage.removeItem("Antidebug_breaker_" + id + "_flag");
        localStorage.removeItem("Antidebug_breaker_" + id + "_param");
        localStorage.removeItem("Antidebug_breaker_" + id + "_debugger");
        localStorage.removeItem("Antidebug_breaker_" + id + "_stack");
    }

    function initHook() {
        let flag = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_flag");
        let param = JSON.parse(localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_param"));
        let is_debugger = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_debugger");
        let is_stack = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_stack");

        let temp_localStorage_setItem = localStorage.setItem;

        localStorage.setItem = function () {
            if (flag === "0") {
                if (arguments[1] && typeof arguments[1] === "object") {
                    console.log("设置了localStorage，键值对为：\n" + arguments[0] + ":" + JSON.stringify(arguments[1]));
                } else {
                    console.log("%c设置了localStorage，键值对为：\n" + arguments[0] + ":" + arguments[1], sone_color);
                }
                if (is_debugger === "1") {
                    debugger;
                }
                if (is_stack === "1") {
                    console.log("%c" + new Error().stack, sone_color);
                }
            } else {
                if (arguments[0] && param.some(item => arguments[0].includes(item))) {
                    if (arguments[1] && typeof arguments[1] === "object") {
                        console.log("捕获到设置了localStorage\n键 ---> " + arguments[0] + " 值 ---> " + JSON.stringify(arguments[1]));
                    } else {
                        console.log("%c捕获到设置了localStorage\n键 ---> " + arguments[0] + " 值 ---> " + arguments[1], sone_color);
                    }
                    if (is_debugger === "1") {
                        debugger;
                    }
                    if (is_stack === "1") {
                        console.log("%c" + new Error().stack, sone_color);
                    }
                }
            }
            return temp_localStorage_setItem.call(this, ...arguments);
        }
        clear_Antidebug(SCRIPT_ID);
    }

    function setupConfigListener() {
        window.addEventListener('message', function (event) {
            // 只接受来自扩展的消息
            if (event.source !== window ||
                !event.data ||
                event.data.source !== 'antidebug-extension' ||
                event.data.type !== 'HOOK_CONFIG_READY') {
                return;
            }

            // 检查是否包含当前脚本ID
            const scriptIds = event.data.scriptIds || [];
            if (scriptIds.includes(SCRIPT_ID)) {
                // 配置已就绪，初始化Hook
                initHook();
            }
        });
    }

    // 立即设置监听器
    setupConfigListener();
})();