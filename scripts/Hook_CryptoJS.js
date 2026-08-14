// ==UserScript==
// @name         Hook_CryptoJS
// @namespace    https://github.com/0xsdeo/Hook_JS
// @version      2025-10-17
// @description  Hook CryptoJS 对称&哈希&HMAC 所有算法
// @author       0xsdeo
// @run-at       document-start
// @match        *
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const sone_color = "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #2f2),color-stop(0.75, #2f2), color-stop(0.9, #ff2), color-stop(1, #f22) );font-size:2em;";

    let time = 0;

    function hasEncryptProp(obj) {
        const requiredProps = [
            'ciphertext',
            'key',
            'iv',
            'algorithm',
            'mode',
            'padding',
            'blockSize',
            'formatter'
        ];

        // 检查对象是否存在且为对象类型
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        // 检查所有必需属性是否存在
        for (const prop of requiredProps) {
            if (!(prop in obj)) {
                return false;
            }
        }

        return true;
    }

    function hasDecryptProp(obj) {
        const requiredProps = [
            'sigBytes',
            'words'
        ];

        // 检查对象是否存在且为对象类型
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        // 检查所有必需属性是否存在
        for (const prop of requiredProps) {
            if (!(prop in obj)) {
                return false;
            }
        }

        return true;
    }

    function get_sigBytes(size) {
        switch (size) {
            case 8:
                return "64bits";
            case 16:
                return "128bits";
            case 24:
                return "192bits";
            case 32:
                return "256bits";
            default:
                return "未获取到";
        }
    }

    let temp_apply = Function.prototype.apply;

    Function.prototype.apply = function () {
        // CryptoJS 对称加密
        if (arguments.length === 2 && arguments[0] && arguments[1] && typeof arguments[1] === 'object' && arguments[1].length === 1 && hasEncryptProp(arguments[1][0])) {
            if (Object.hasOwn(arguments[0], "$super") && Object.hasOwn(arguments[1], "callee")) {
                if (this.toString().indexOf('function()') !== -1 || /^\s*function(?:\s*\*)?\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{/.test(this.toString()) || /^\s*function\s*\(\s*\)\s*\{/.test(this.toString())) {
                    console.log(...arguments);

                    let encrypt_text = arguments[0].$super.toString.call(arguments[1][0]);
                    if (encrypt_text !== "[object Object]") {
                    console.log("%c对称加密后的密文：%s", sone_color, encrypt_text);
                    } else {
                        console.log("%c对称加密后的密文：由于toString方法并未获取到，请自行使用上方打印的对象进行toString调用输出密文。", sone_color);
                    }

                    let key = arguments[1][0]["key"].toString();
                    if (key !== "[object Object]") {
                        console.log("%c对称加密Hex key：%s", sone_color, key);
                    } else {
                        console.log("%c对称加密Hex key：由于toString方法并未获取到，请自行使用上方打印的对象进行toString调用输出key。", sone_color);
                    }

                    let iv = arguments[1][0]["iv"];

                    if (iv) {
                        if (iv.toString() !== "[object Object]") {
                            console.log("%c对称加密Hex iv：%s", sone_color, iv.toString());
                        } else {
                            console.log("%c对称加密Hex iv：由于toString方法并未获取到，请自行使用上方打印的对象进行toString调用输出iv。", sone_color);
                        }
                    } else {
                        console.log("%c对称加密时未用到iv", sone_color);
                    }
                    if (arguments[1][0]["padding"]) {
                        console.log("%c对称加密时的填充模式：%s", sone_color, arguments[1][0]["padding"]);
                    }
                    if (arguments[1][0]["mode"] && Object.hasOwn(arguments[1][0]["mode"], "Encryptor")) {
                        console.log("%c对称加密时的运算模式：%s", sone_color, arguments[1][0]["mode"]["Encryptor"]["processBlock"]);
                    }
                    if (arguments[1][0]["key"] && Object.hasOwn(arguments[1][0]["key"], "sigBytes")) {
                        console.log("%c对称加密时的密钥长度：%s", sone_color, get_sigBytes(arguments[1][0]["key"]["sigBytes"]));
                    }
                    console.log("%c---------------------------------------------------------------------", sone_color);
                } else {
                    console.groupCollapsed("%c如果上方正常输出了对称加密的key、iv等加密参数可忽略本条信息。", sone_color);
                    console.log(...arguments);
                    console.log("%c对称加密：由于一些必要因素导致未能输出key、iv等加密参数，请自行使用上方打印的对象进行toString调用输出key、iv等加密参数。", sone_color);
                    console.log("%c---------------------------------------------------------------------", sone_color);
                    console.groupEnd();
                }
            }
            // CryptoJS 对称解密
        } else if (arguments.length === 2 && arguments[0] && arguments[1] && typeof arguments[1] === 'object' && arguments[1].length === 3 && hasDecryptProp(arguments[1][1])) {
            if (Object.hasOwn(arguments[0], "$super") && Object.hasOwn(arguments[1], "callee")) {
                if (this.toString().indexOf('function()') === -1 && arguments[1][0] === 2) {
                    console.log(...arguments);

                    let key = arguments[1][1].toString();
                    if (key !== "[object Object]") {
                        console.log("%c对称解密Hex key：%s", sone_color, key);
                    } else {
                        console.log("%c对称解密Hex key：由于toString方法并未获取到，请自行使用上方打印的对象进行toString调用输出key。", sone_color);
                    }

                    if (Object.hasOwn(arguments[1][2], "iv") && arguments[1][2]["iv"]) {
                        let iv = arguments[1][2]["iv"].toString();
                        if (iv !== "[object Object]") {
                            console.log("%c对称解密Hex iv：%s", sone_color, iv);
                        } else {
                            console.log("%c对称解密Hex iv：由于toString方法并未获取到，请自行使用上方打印的对象进行toString调用输出iv。", sone_color);
                        }
                    } else {
                        console.log("%c对称解密时未用到iv", sone_color);
                    }

                    if (Object.hasOwn(arguments[1][2], "padding") && arguments[1][2]["padding"]) {
                        console.log("%c对称解密时的填充模式：%s", sone_color, arguments[1][2]["padding"]);
                    }
                    if (Object.hasOwn(arguments[1][2], "mode") && arguments[1][2]["mode"]) {
                        console.log("%c对称解密时的运算模式：%s", sone_color, arguments[1][2]["mode"]["Encryptor"]["processBlock"]);
                    }
                    if (time === 0) {
                        console.log("%c可使用我的脚本进行fuzz加解密参数（算法、模式、填充方式等）：https://github.com/0xsdeo/Fuzz_Crypto_Algorithms", sone_color);
                        time += 1;
                    }
                    console.log("%c---------------------------------------------------------------------", sone_color);
                }
            }
            // CryptoJS 哈希 / HMAC
        } else if (arguments.length === 2 && arguments[0] && arguments[1] && typeof arguments[0] === 'object' && typeof arguments[1] === 'object') {
            if (arguments[0].__proto__ && Object.hasOwn(arguments[0].__proto__, "$super") && Object.hasOwn(arguments[0].__proto__, "_doFinalize") && arguments[0].__proto__.__proto__ && Object.hasOwn(arguments[0].__proto__.__proto__, "finalize")) {
                if (arguments[0].__proto__.__proto__.finalize.toString().indexOf('哈希/HMAC') === -1) {
                    let temp_finalize = arguments[0].__proto__.__proto__.finalize;

                    arguments[0].__proto__.__proto__.finalize = function () {
                        if (!(Object.hasOwn(this, "init"))) {
                            let hash = temp_finalize.call(this, ...arguments);
                            console.log("%c哈希/HMAC 加密 原始数据：" + (arguments[0] && typeof arguments[0] === "object" ? JSON.stringify(arguments[0]) : arguments[0]));
                            console.log("%c哈希/HMAC 加密 密文：%s", sone_color, hash.toString());
                            console.log("%c哈希/HMAC 加密 密文长度：%s", sone_color, hash.toString().length);
                            console.log("%c注：如果是HMAC加密，本脚本是hook不到密钥的，需自行查找。", sone_color);
                            console.log("%c---------------------------------------------------------------------", sone_color);
                            return hash;
                        }
                        return temp_finalize.call(this, ...arguments)
                    }
                }
            }
        }
        return temp_apply.call(this, ...arguments);
    }
})();