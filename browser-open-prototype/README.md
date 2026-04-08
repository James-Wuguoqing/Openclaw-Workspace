# Browser Open Prototype

一个最小原型：让本地 companion 接收 `open_url` 请求，并由浏览器扩展真正打开网页。

## 结构

- `companion/server.js`：本地 HTTP 服务，接收打开 URL 的请求，并缓存一个待处理动作
- `extension/`：Chrome/Edge 扩展，轮询本地服务并打开标签页

## 能力范围

当前只支持：
- 打开 `http://` / `https://` URL

默认安全限制：
- 拒绝 `file:` / `javascript:` / `data:` 等协议
- 一次只消费一个待处理动作

## Companion 启动

### 前台启动
```bash
cd browser-open-prototype/companion
node server.js
```

### 后台常驻启动
```bash
cd browser-open-prototype/companion
./browser_companion_start
```

查看状态：
```bash
./browser_companion_status
```

停止：
```bash
./browser_companion_stop
```

默认监听：
- `http://127.0.0.1:3210`

## 手动测试

提交一个打开请求（推荐用本地命令入口）：

```bash
cd browser-open-prototype/companion
node open_url.js https://www.jd.com
```

也可以直接用 curl：

```bash
curl -X POST http://127.0.0.1:3210/open-url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.jd.com"}'
```

查看待处理动作：

```bash
curl http://127.0.0.1:3210/next-action
```

## 安装扩展

1. 打开 Chrome / Edge
2. 进入扩展管理页面
3. 开启开发者模式
4. 选择“加载已解压的扩展程序”
5. 选择 `browser-open-prototype/extension`

## 目前工作方式

- 扩展每 2 秒轮询一次 `http://127.0.0.1:3210/next-action`
- 如果拿到 `{ type: "open_url", url: ... }`
- 就调用浏览器标签页 API 新开网页

## 命令入口

### Node 版本
```bash
cd browser-open-prototype/companion
node open_url.js https://www.jd.com
```

### Shell 命令版本
```bash
cd browser-open-prototype/companion
./open_url https://www.jd.com
```

如果 companion 没启动，会直接报错提醒。

## 下一步可扩展

- WebSocket 替代轮询
- 白名单域名
- 当前标签 / 新标签 / 后台标签模式
- OpenClaw 侧包装成 `open_url` 工具
