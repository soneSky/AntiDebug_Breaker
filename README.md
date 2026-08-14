![Antidebug_Breaker](https://socialify.git.ci/0xsdeo/Antidebug_Breaker/image?description=1&font=Bitter&forks=1&language=1&logo=https%3A%2F%2Fp3-flow-imagex-sign.byteimg.com%2Ftos-cn-i-a9rns2rl98%2Frc_gen_image%2F83c1cf6f637940bba9ecb828b7f58ebc.jpeg%7Etplv-a9rns2rl98-image_raw_b.png%3Frcl%3D2025112123094019020B8768AB108FBE9E%26rk3s%3D8e244e95%26rrcfp%3D827586d3%26x-expires%3D2079097789%26x-signature%3DK1FvDsOfH%252BFlP1DmNm1nns1vAaM%253D&name=1&owner=1&pattern=Overlapping+Hexagons&stargazers=1&theme=Light)

## Intro

本插件是基于<a href="https://github.com/0xsdeo/Hook_JS">Hook_JS</a>库所写的Google插件，将致力于辅助前端JavaScript逆向以及渗透测试信息收集。

**新增 MCP Server 支持**：通过 MCP（Model Context Protocol）协议与 Cursor AI 集成，实现 AI 驱动的浏览器自动化和 JS 逆向分析。

如何提交您自己的脚本：<a href="https://github.com/0xsdeo/AntiDebug_Breaker/wiki/%E6%8F%90%E4%BA%A4%E6%82%A8%E8%87%AA%E5%B7%B1%E7%9A%84hook%E8%84%9A%E6%9C%AC">AntiDebug_Breaker wiki</a>

## 赞助商

感谢以下朋友与伙伴对 AntiDebug Breaker 的支持。

| Logo | 赞助商 | 介绍 | 邀请码 | 官网 |
| :--- | :--- | :--- | :--- | :--- |
| [![BirdProxies](image/README/1779357961398.png)](https://birdproxies.com/@ANTIDEBUG_BREAKER) | BirdProxies | 代理不该复杂也不该贵。覆盖 195+ 地区的快速住宅代理和 ISP 代理，价格公道，支持到位。官网首页玩 FlappyBird 小游戏可免费领流量。 | 首单10%折扣 + 额外15%住宅代理免费流量<br>测试联系：https://discord.com/invite/birdproxies | [立即注册](https://birdproxies.com/@ANTIDEBUG_BREAKER) |

## 教学视频

反调试：https://www.bilibili.com/video/BV1gQ4mzMEA4

Vue：https://www.bilibili.com/video/BV12148z7EnP

Hook CryptoJS对称加密 快速出key、iv、mode、padding：https://www.bilibili.com/video/BV1MPW1zDEK8

JS逆向快速定位加密位置以及获取加密密文等加密参数：https://www.bilibili.com/video/BV1cRyXBaEJX

SpiderDemo 靶场练习网站：https://www.spiderdemo.cn

## 插件安装

### 谷歌插件应用商店安装

地址：https://chromewebstore.google.com/detail/antidebug-breaker/opkclndfcbafdaecbbaklefnaadopcln

### 手动安装

将源码下载到本地后打开chrome，访问`chrome://extensions/`，点击左上角的`加载未打包的扩展程序`，然后选中源码文件夹即可：
![1753669187234](image/README/1753669187234.png)

## MCP Server 集成

本插件新增了 MCP（Model Context Protocol）服务器，可与 Cursor AI 等支持 MCP 的工具集成，实现 AI 驱动的浏览器自动化和 JS 逆向分析。

### 构建 MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### Cursor 配置

在 Cursor 的 `~/.cursor/mcp.json` 中添加以下配置：

```json
{
  "mcpServers": {
    "AntiDebug_Breaker_mcp": {
      "command": "node",
      "args": ["/path/to/AntiDebug_Breaker_mcp/mcp-server/dist/index.js"],
      "env": {
        "MCP_PORT": "9527"
      }
    }
  }
}
```

注意将 `/path/to/` 替换为实际路径。

### 使用说明

1. 启动 MCP Server：`cd mcp-server && npm start`
2. 在 Chrome 中加载插件（开发模式），打开目标网站
3. 点击插件弹出窗口 → MCP 标签 → 启用 MCP 开关
4. 确保端口与 mcp.json 中配置一致
5. 在 Cursor 中使用 MCP 工具控制浏览器

### MCP 工具列表

| 工具名 | 功能描述 |
|--------|----------|
| `get_connection_status` | 获取浏览器扩展的连接状态 |
| `get_page_info` | 获取当前页面基本信息（URL、标题、域名等） |
| `get_network_requests` | 获取网络请求/API调用记录 |
| `get_vue_routes` | 获取Vue Router路由信息 |
| `get_hook_data` | 获取Hook脚本捕获的数据 |
| `get_enabled_scripts` | 获取当前已启用的脚本列表 |
| `toggle_script` | 启用/禁用指定脚本 |
| `navigate_to` | 导航到指定URL或Vue路由 |
| `get_cookies` | 获取当前页面的Cookie |
| `get_local_storage` | 获取LocalStorage数据 |
| `get_session_storage` | 获取SessionStorage数据 |
| `execute_script` | 在页面上下文中执行JavaScript代码 |
| `get_dom_info` | 获取页面DOM结构信息 |
| `configure_hook` | 配置Hook脚本的参数（关键字过滤、debugger开关等） |
| `list_available_scripts` | 获取所有可用脚本列表及其描述 |
| `refresh_page` | 刷新当前页面 |
| `take_screenshot` | 截取当前页面的屏幕截图 |
| `click_element` | 点击页面上的元素 |
| `fill_input` | 在输入框中填充文本 |
| `press_key` | 模拟按键操作 |
| `get_console_messages` | 获取浏览器控制台消息 |
| `scroll_page` | 滚动页面到指定位置或元素 |
| `wait_for_selector` | 等待页面上出现指定元素 |
| `get_element_info` | 获取页面元素的详细信息 |
| `prepare_route_access` | 准备访问Vue路由（自动启用必要脚本） |
| `scan_route_for_api` | 访问指定路由并收集该路由触发的API请求 |
| `batch_scan_routes` | 批量访问多个路由并收集所有API请求 |
| `enable_encryption_hooks` | 启用RSA和CryptoJS加密Hook脚本 |
| `analyze_page_encryption` | 分析当前页面使用的加密库和密钥 |
| `auto_login_and_capture` | 自动填写登录表单并捕获加密数据 |
| `get_captured_encryption` | 获取Hook脚本捕获的加密数据 |
| `decrypt_rsa` | 使用私钥解密RSA加密的数据 |
| `extract_keys_from_js` | 从JS文件提取RSA公钥、私钥等加密信息 |
| `analyze_login_encryption` | 一键分析登录页面的密码加密方式 |
| `detect_anti_debug` | 检测页面中的反调试机制 |
| `auto_bypass_anti_debug` | 检测并自动启用相应的反调试绕过脚本 |
| `analyze_api_signature` | 分析最近的API请求，提取签名参数 |
| `extract_vue_data` | 提取页面Vue组件的data、computed、methods等数据 |
| `extract_react_data` | 提取页面React组件的props、state等数据 |
| `analyze_authentication` | 分析页面的认证机制（Cookie、localStorage中的token等） |
| `get_page_forms` | 获取页面所有表单信息 |
| `auto_fill_form` | 自动填充指定表单的输入框 |
| `inject_ws_monitor` | 注入WebSocket监控，捕获所有WebSocket通信 |
| `get_ws_messages` | 获取捕获的WebSocket消息 |
| `extract_page_data` | 根据选择器提取页面结构化数据 |
| `extract_table_data` | 提取页面表格数据为结构化格式 |
| `full_page_analysis` | 一键全面分析页面：反调试检测、框架识别、加密分析、认证分析 |
| `click_and_capture` | 点击指定元素并捕获产生的所有网络请求 |
| `get_network_requests_burp` | 获取网络请求并转换为Burp Suite格式 |
| `click_and_get_burp` | 点击元素并获取产生的网络请求（Burp格式） |
| `login_and_get_burp` | 自动填写登录表单并获取登录请求的Burp格式数据包 |
| `scan_sensitive_data` | 扫描最近的API响应中是否包含敏感数据（身份证、手机号、银行卡等） |
| `scan_route_sensitive_data` | 访问指定路由并扫描返回数据中的敏感信息泄露 |
| `batch_scan_sensitive_routes` | 批量扫描多个路由，检测敏感数据泄露 |
| `start_sensitive_monitor` | 开始实时监控所有API响应中的敏感数据泄露 |
| `get_sensitive_alerts` | 获取敏感数据监控产生的告警信息 |
| `get_headers_config` | 获取当前所有请求头组和请求头的配置信息 |
| `create_header_group` | 创建一个新的请求头组 |
| `delete_header_group` | 删除指定的请求头组 |
| `switch_header_group` | 切换到指定的请求头组 |
| `add_header` | 向指定请求头组添加一个请求头 |
| `update_header` | 更新指定请求头的名称、值或启用状态 |
| `delete_header` | 从请求头组中删除指定的请求头 |
| `toggle_header` | 启用或禁用指定的请求头 |
| `batch_update_headers` | 批量更新请求头组中的所有请求头 |
| `quick_set_headers` | 快速设置请求头：创建组+添加请求头+启用 |
| `smart_enable_scenario` | 根据用户意图智能启用相关脚本组合 |
| `list_scenarios` | 获取所有可用的智能场景配置列表 |
| `quick_encryption_analysis` | 一键启用加密分析（Hook JSEncrypt RSA + Hook CryptoJS） |
| `quick_anti_debug_bypass` | 一键反调试绕过（自动检测 + 启用绕过脚本） |
| `quick_api_analysis` | 一键API分析（启用XHR/Fetch Hook脚本） |
| `quick_vue_analysis` | 一键Vue分析（启用路由获取脚本） |
| `smart_unauthorized_test` | 智能未授权测试（先检测Vue站点，再进行未授权测试） |
| `detect_site_framework` | 检测当前站点使用的前端框架（Vue、React等） |
| `batch_enable_scripts` | 批量启用或禁用多个脚本 |
| `disable_all_scripts` | 禁用当前页面的所有已启用脚本 |

## 脚本使用场景

>AntiDebug

- <a href="#Bypass_Debugger">Bypass Debugger</a>
- <a href="#hook_log">hook log</a>
- <a href="#Hook_table">Hook table</a>
- <a href="#hook_clear">hook clear</a>
- <a href="#hook_close">hook close</a>
- <a href="#hook_history">hook history</a>
- <a href="#Fixed_window_size">Fixed window size</a>
- <a href="#location_href">页面跳转JS代码定位通杀方案</a>
- <a href="#Hook_CryptoJS">Hook CryptoJS</a>
- <a href="#Hook_JSEncrypt_RSA">Hook JSEncrypt RSA</a>
- <a href="#Hook_SMcrypto">Hook SM-crypto</a>

>Hook

- <a href="#document.cookie">document.cookie</a>
- <a href="#XMLHttpRequest.setRequestHeader">XMLHttpRequest.setRequestHeader</a>
- <a href="#XMLHttpRequest.open">XMLHttpRequest.open</a>
- <a href="#localStorage.setItem">localStorage.setItem</a>
- <a href="#localStorage.getItem">localStorage.getItem</a>
- <a href="#localStorage.removeItem">localStorage.removeItem</a>
- <a href="#localStorage.clear">localStorage.clear</a>
- <a href="#sessionStorage.setItem">sessionStorage.setItem</a>
- <a href="#sessionStorage.getItem">sessionStorage.getItem</a>
- <a href="#sessionStorage.removeItem">sessionStorage.removeItem</a>
- <a href="#sessionStorage.clear">sessionStorage.clear</a>
- <a href="#fetch">fetch</a>
- <a href="#JSON.parse">JSON.parse</a>
- <a href="#JSON.stringify">JSON.stringify</a>
- <a href="#Promise">Promise</a>
- <a href="#Math.random">Math.random</a>
- <a href="#Date.now">Date.now</a>
- <a href="#flip_video">视频代码翻转</a>

> Vue

- <a href="#Get_Vue_0">获取路由</a>
- <a href="#Get_Vue_1">清除跳转</a>
- <a href="#Clear_vue_Navigation_Guards">清除路由守卫</a>
- <a href="#detectorExec">激活Vue Devtools</a>

> React

- <a href="#Get_React_0">获取路由</a>

### 反调试

- <a id="Bypass_Debugger" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Bypass_Debugger.js">Bypass Debugger</a>

该脚本用于绕过**无限Debugger**，目前引起无限Debugger的三种核心方式为：

> eval

> Function

> Function.prototype.constructor

本脚本通过 Hook 以上核心函数有效绕过大部分前端无限 debugger。但因 eval 作用域问题，某些网站可能会报错。此时可切换至火狐浏览器无视debugger进行调试。

注：极少数网站可能采用特殊反制措施（如故意引发eval作用域问题或其他问题），导致前端报错或依然能引起debugger，这种情况需针对性解决。总体而言，**本脚本能覆盖绝大多数场景**。

脚本原理：<a href="https://mp.weixin.qq.com/s/3xagT-PXCgGrw9YiaCe__g">JS逆向系列14-Bypass Debugger</a>

- <a id="hook_log" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_log.js">hook log</a>

本脚本为<a href="https://github.com/lyousan">Yosan</a>师傅所作，用于防止js重写console.log等方法。

- <a id="Hook_table" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_table.js">Hook table</a>

绕过js检测运行时间差来实现反调试。

本脚本将针对以下这三种特征的反调试网站(注：包括但不仅限于这以下三种特征，需根据实际情况去判断是否需要使用本脚本)：

> 频繁调用console.clear清除控制台数据

> 控制台频繁输出大量内容

> 进行完以上两种操作后直接使用location.href进行跳转，一般跳转到主域名为github.io的网站。

如存在以上特征的网站，均可尝试使用本脚本去进行绕过。

脚本原理：<a href="https://mp.weixin.qq.com/s/JZu-fknVdEpaI5anzSlLjg">JS逆向系列19-无感绕过一类运行时间差反调试</a>

- <a id="hook_clear" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_clear.js">hook clear</a>

禁止js清除控制台数据。

脚本原理：<a href="https://mp.weixin.qq.com/s/r-ZcP2knpmoVEK0y_26xBw">JS逆向系列10-反调试与反反调试</a>

- <a id="hook_close" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_close.js">hook close</a>

重写close，以此来避免网站反调试关闭当前页面。

脚本原理：<a href="https://mp.weixin.qq.com/s/r-ZcP2knpmoVEK0y_26xBw">JS逆向系列10-反调试与反反调试</a>

- <a id="hook_history" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_history.js">hook history</a>

避免网站反调试返回上一页或某个特定历史页面。

脚本原理：<a href="https://mp.weixin.qq.com/s/r-ZcP2knpmoVEK0y_26xBw">JS逆向系列10-反调试与反反调试</a>

- <a id="Fixed_window_size" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Fixed_window_size.js">Fixed window size</a>

固定浏览器高度宽度值以绕过前端检测用户是否打开控制台。

固定的宽度高度值：
```text
innerHeight：660
innerWidth：1366

outerHeight：760
outerWidth：1400
```

- <a id="location_href" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/location_href.js">页面跳转JS代码定位通杀方案</a>

本脚本为<a href="https://github.com/CC11001100">CC11001100</a>师傅所作，脚本原地址：`https://github.com/JSREI/page-redirect-code-location-hook`，用于阻断页面跳转，留在当前页面分析。

- <a id="Hook_CryptoJS" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Hook_CryptoJS.js">Hook CryptoJS</a>

Hook CryptoJS当中的所有 对称&哈希&HMAC算法，例如AES、DES、MD5、SHA等。如果未打印请自查目标站点是否清除了console.log或是否使用的是CryptoJS的加密算法，如果确认使用的是CryptoJS库进行的加密而无法打印可联系我。

- <a id="Hook_JSEncrypt_RSA" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Hook_JSEncrypt.js">Hook JSEncrypt RSA</a>

Hook JSEncrypt加密库中的RSA算法，加密时将在控制台打印公钥、原始数据、加密后的密文。解密时将在控制台打印私钥、原始数据、解密后的明文。如果未打印请自查目标站点是否清除了console.log或是否使用的是JSEncrypt的RSA算法，如果确认使用的是JSEncrypt库进行的RSA加密而无法打印可联系我。

- <a id="Hook_SMcrypto" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Hook_SMcrypto.js">Hook SM-crypto</a>

本脚本思路与初始形态为<a href="https://github.com/Hosinoharu">魔法少女☆ホシノ</a>所作。

Hook SM-crypto加密库当中的 SM2、SM3、SM4算法。如果未打印请自查目标站点是否清除了console.log或是否使用的是sm-crypto的加密算法，如果清除了console.log可以尝试使用hook log脚本防止js重写log方法，如果确认使用的是sm-crypto库进行的加密而无法打印可联系我。

### Hook

- <a id="document.cookie" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Hook_cookie.js">document.cookie</a>

开启本脚本后默认将在控制台打印设置的cookie，如果需要打印特定cookie请在下方输入框中输入cookie名称，脚本将会捕获这些特定cookie名。

- <a id="XMLHttpRequest.setRequestHeader" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_xhr_setRequestHeader.js">XMLHttpRequest.setRequestHeader</a>

开启本脚本后默认将在控制台打印设置的请求头，如果需要打印特定请求头请在下方输入框中输入请求头名称，脚本将会捕获这些特定请求头名。

- <a id="XMLHttpRequest.open" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_xhr_open.js">XMLHttpRequest.open</a>

开启本脚本后默认将在控制台打印初始化xhr请求配置(url,method)，如果需要捕获特定url请在下方输入框中输入url名称，脚本将会捕获这些特定url名称。

- <a id="localStorage.setItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_localStorage_setItem.js">localStorage.setItem</a>

开启本脚本后默认将在控制台打印设置的localStorage键值，如果需要捕获特定键请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="localStorage.getItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_localStorage_getItem.js">localStorage.getItem</a>

开启本脚本后默认将在控制台打印站点读取的localStorage键名，如果需要捕获特定键名请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="localStorage.removeItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_localStorage_removeItem.js">localStorage.removeItem</a>

开启本脚本后默认将在控制台打印移除的localStorage键名，如果需要捕获特定键名请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="localStorage.clear" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_localStorage_clear.js">localStorage.clear</a>

开启本脚本后如果站点进行了清空localStorage动作，默认会在控制台打印消息。

- <a id="sessionStorage.setItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_sessionStorage_setItem.js">sessionStorage.setItem</a>

开启本脚本后默认将在控制台打印设置的sessionStorage键值，如果需要捕获特定键请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="sessionStorage.getItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_sessionStorage_getItem.js">sessionStorage.getItem</a>

开启本脚本后默认将在控制台打印站点读取的sessionStorage键名，如果需要捕获特定键名请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="sessionStorage.removeItem" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_sessionStorage_removeItem.js">sessionStorage.removeItem</a>

开启本脚本后默认将在控制台打印移除的sessionStorage键名，如果需要捕获特定键名请在下方输入框中输入键名，脚本将会捕获这些特定键名。

- <a id="sessionStorage.clear" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_sessionStorage_clear.js">sessionStorage.clear</a>

开启本脚本后如果站点进行了清空sessionStorage动作，默认会在控制台打印消息。

- <a id="fetch" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_fetch.js">fetch</a>

开启本脚本后默认将在控制台打印fetch请求设置。

- <a id="JSON.parse" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_json_parse.js">JSON.parse</a>

开启本脚本后默认将在控制台打印传入的JSON，如果需要捕获特定JSON请在下方输入框中输入JSON，脚本将会捕获这些特定JSON字符串。

- <a id="JSON.stringify" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_json_stringify.js">JSON.stringify</a>

开启本脚本后默认将在控制台打印传入JSON.stringify的值。

- <a id="Promise" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_Promise.js">Promise</a>

本脚本为<a href="https://github.com/lyousan">Yosan</a>师傅所作。

将在控制台打印Promise的resolve参数，可快速定位异步回调位置。

- <a id="Math.random" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/hook_random.js">Math.random</a>

固定Math.random返回值

- <a id="Date.now" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Hook_Date_now.js">Date.now</a>

固定Date.now返回值

- <a id="flip_video" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/flip_video.js">视频代码翻转</a>

对页面中的 video 元素进行放大和旋转操作。默认放大倍数为 1.5，旋转角度为 90 度。支持通过 Hook 配置参数调节 scale（放大倍数）和 rotate（旋转角度）。脚本会自动监听 DOM 变化，当检测到新增 video 元素时自动应用翻转。也可在控制台调用 `window.flipVideo(scale, rotate)` 动态调整参数。

### Vue

- <a id="Get_Vue_0" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Get_Vue_0.js">获取路由</a>

获取已加载的路由并显示在下方的表格中，注意未加载的路由不会被获取到，如果长时间未获取到可能是由于目标站点未使用vue router，也可能是因为目标站点未加载完毕。

- <a id="Get_Vue_1" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Get_Vue_1.js">清除跳转</a>

本脚本将清除vue router的跳转方法，如果清除后依然会跳转，一方面可能是由于注入的脚本还未清除跳转方法，网站就调用了方法进行跳转，此时可以考虑手动替换js清除跳转方法。另一方面可能是由于在代码中调用的不是vue router的跳转方法，此时可以考虑开启反调试板块中的hook close或hook history脚本，再或者打开页面跳转JS代码定位通杀方案脚本，定位到跳转的函数并替换清除。

- <a id="Clear_vue_Navigation_Guards" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Clear_vue_Navigation_Guards.js">清除路由守卫</a>

仅清除全局前置守卫(beforeEach)和全局解析守卫(beforeResolve)，如果清除后网站控制台显示报错，可能是由于在路由守卫中做了动态加载等其他操作，此时可以考虑关闭本脚本并亲自替换js逻辑实现绕过。

脚本原理：<a href="https://mp.weixin.qq.com/s/klhBr2V7UJpspiAmRY1DXQ">最大化收集Vue框架(SPA类型)下的js</a>

- <a id="detectorExec" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/detectorExec.js">激活Vue Devtools</a>

本脚本引用自<a href="https://github.com/hzmming/vue-force-dev">vue-force-dev</a>。

当开启本脚本后将激活Vue Devtools。Vue2需开启Vue.js devtools(v5)，Vue3需开启Vue.js devtools，可自行去谷歌插件商店安装上述两个插件。注：1.上述两个插件不能同时开。2.当下方没有检测到Vue Router时并不能代表网站不是Vue框架，只能说明网站并没有使用Vue Router。

### React

- <a id="Get_React_0" href="https://github.com/0xsdeo/AntiDebug_Breaker/blob/main/scripts/Get_React_0.js">获取路由</a>

获取已加载的路由并显示在下方的表格中，注意未加载的路由不会被获取到，如果长时间未获取到可能是由于目标站点未使用react router，也可能是因为目标站点未加载完毕。

## 插件使用注意事项

1. 本插件目前不支持火狐。
2. 进入网页后，无论是开启脚本还是关闭脚本，需刷新页面后才会生效。
3. **更新插件时请将旧版本插件从浏览器中移除再导入新版插件。**

## 致谢

致谢个人：<a href="https://github.com/Hosinoharu">魔法少女☆ホシノ</a>、<a href="https://github.com/CC11001100">CC11001100</a>、<a href="https://github.com/mingheyan">Dexter</a>、<a href="https://github.com/d1sbb">d1sbb</a>、<a href="https://github.com/lyousan">Yosan</a>

本项目参考过、引用过或正在引用的优质项目：<a href="https://github.com/Ad1euDa1e/VueCrack">VueCrack</a>、<a href="https://github.com/keecth/FakeCryptoJS">FakeCryptoJS</a>、<a href="https://github.com/hzmming/vue-force-dev">vue-force-dev</a>

## Contact

如有bug或其他问题可提交issues，或者关注公众号Spade sec联系我。

如需添加交流群可加我微信：I-0xsdeo。

## 使用许可

本工具禁止未授权商业用途，禁止二次开发后进行未授权商业用途。

## 404星链计划
<img src="https://github.com/knownsec/404StarLink-Project/raw/master/logo.png" width="30%">

AntiDebug_Breaker 现已加入 [404星链计划](https://github.com/knownsec/404StarLink)

## Star History
[![Stargazers over time](https://starchart.cc/0xsdeo/AntiDebug_Breaker.svg?variant=adaptive)](https://starchart.cc/0xsdeo/AntiDebug_Breaker)
