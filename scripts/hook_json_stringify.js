// ==UserScript==
// @name         hook_JSON
// @namespace    https://github.com/0xsdeo/Hook_JS
// @version      2024-10-29
// @description  重写parse和stringify方法，以此来获取调用这个方法所传入的内容以及堆栈信息。
// @author       0xsdeo
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_ID = 'hook_json_stringify';

    const sone_color = "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );font-size:2em;";

    function clear_Antidebug(id) {
        localStorage.removeItem("Antidebug_breaker_" + id + "_flag");
        localStorage.removeItem("Antidebug_breaker_" + id + "_debugger");
        localStorage.removeItem("Antidebug_breaker_" + id + "_stack");
    }

    function initHook() {
        let flag = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_flag");
        // 默认启用 hook，如果没有设置 flag 则默认为 "0"
        if (flag === null) {
            flag = "0";
            localStorage.setItem("Antidebug_breaker_" + SCRIPT_ID + "_flag", "0");
        }
        let is_debugger = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_debugger");
        let is_stack = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_stack");

        let json_s = JSON.stringify;
        JSON.stringify = function () {
            if (flag === "0") {
                if (arguments[0] && typeof arguments[0] === "string") {
                    console.log("%c调用JSON.stringify，参数：\n%s", sone_color, arguments[0]);
                } else {
                    console.log("%c调用JSON.stringify，参数：", sone_color, ...arguments);
                }
                if (is_debugger === "1") {
                    debugger;
                }
                if (is_stack === "1") {
                    console.log("%c" + new Error().stack, sone_color);
                }
            }
            console.log("%c调用JSON.stringify返回值 --->", sone_color, json_s(...arguments));
            return json_s(...arguments);
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

    // 如果没有收到扩展消息，也尝试直接初始化（支持单独作为 UserScript 运行）
    setTimeout(() => {
        let flag = localStorage.getItem("Antidebug_breaker_" + SCRIPT_ID + "_flag");
        // 如果还没有配置，自动设置默认配置并初始化
        if (flag === null) {
            localStorage.setItem("Antidebug_breaker_" + SCRIPT_ID + "_flag", "0");
            initHook();
        } else {
            initHook();
        }
    }, 100);
})();