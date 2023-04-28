# pocketrose-assistant

### 功能说明

#### 战斗部分

1. 根据战斗结果的页面分析，推荐后续的行为。为玩家只保留返回、住宿、存钱、修理四选一的按钮。
2. 战斗后自动页面触底，方便玩家选择。
3. 战斗如果有入手，在页面最下面显示NPC窗口提示玩家。

#### 冒险部分

1. 实现自动移动的基础模块，实现在地图两点间移动路径的计算和行动。并提供到达目的地后的回调。
2. 城市客栈升级客栈+驿站，提供到其他城市和自己城堡的自动移动功能。
3. 原藏宝图以旧换新升级为冒险家公会，可以指定移动到地图任意坐标。并可以选择自由的1~N张藏宝图，一次移动并探索，全部完成后自动回城。

#### 管理部分

1. 装备管理界面UI改造，ajax改造，集成了装备出售、装备发送等功能。
2. 宠物管理界面UI改造，ajax改造，集成了宠物封印、宠物赠送等功能。

以上是主要的功能修改，还有很多杂七杂八的增强型修改，就不详细列举了。

### 篡改猴文件头

```
// ==UserScript==
// @name         pocketrose assistant
// @namespace    https://pocketrose.itsns.net.cn/
// @description  Intercepts and modifies pocketrose CGI requests
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      mit
// @author       xiaohaiz,fugue
// @version      ${version}
// @grant        unsafeWindow
// @match        *://pocketrose.itsns.net.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-cookie/3.0.1/js.cookie.min.js
// @run-at       document-start
// @unwrap
// ==/UserScript==
```