# OpenClaw Workspace

这是一个面向个人使用的 OpenClaw 助手工作区。

它不只是脚本目录，也包含：
- 助手身份与行为规则
- 用户偏好与上下文
- memory / continuity 机制
- skills 扩展
- 一个已经跑通的 Notion 财经早报自动化流程

---

## 推荐阅读顺序

如果你第一次进入这个仓库，建议按下面顺序阅读：

1. `AGENTS.md`
2. `PROJECT_HISTORY.md`
3. `SOUL.md`
4. `USER.md`
5. `IDENTITY.md`
6. `TOOLS.md`
7. `memory/`
8. `notion-direct/`
9. `skills/`

---

## 核心目录说明

### `AGENTS.md`
工作区级操作规则：启动顺序、memory 约定、heartbeat / cron 分工、边界与工作方式。

### `PROJECT_HISTORY.md`
项目演进记录入口。适合快速理解这个 workspace 是怎么一步步长出来的。

### `SOUL.md`
助手的性格、原则和行为风格。

### `USER.md`
用户信息、称呼、时区和偏好。

### `memory/`
按天记录的运行记忆与事项日志。

### `notion-direct/`
当前最成熟的一块业务能力：
每天生成并写入 Notion 的“财经早报 Top 5”自动化流程。

### `skills/`
本地技能扩展目录，目前包含：
- `self-improving-agent`
- `skill-vetter`

---

## 当前阶段

当前仓库处于：**可运行的个人助手原型（Prototype）**

已经具备：
- 明确人格与工作边界
- 可用的 Notion 自动化能力
- 初步的 skills 扩展能力
- 基本的项目历史与 memory 沉淀

---

## 入口建议

如果你只想用最短时间看懂这个仓库，就读：

- `AGENTS.md`
- `PROJECT_HISTORY.md`
- `notion-direct/`
