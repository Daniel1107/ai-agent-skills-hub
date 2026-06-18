# skill-vetter-gate 审计记录

结论：PASS，仅限 `ponytail-manual` 手动版。

## 证据

- 来源仓库存在：`https://github.com/DietrichGebert/ponytail`。
- 原仓库包含 Codex 插件、skills、hooks、MIT license。
- 原版插件 hooks 会在会话启动和用户提交时运行 Node.js，并注入上下文。
- 用户明确要求不得自动挂载、自主执行，必须手动调用。

## 风险处理

- 不安装原版 Codex plugin。
- 不启用 hooks。
- 不写入全局 AGENTS。
- 不设置 always-on。
- 仅保留手动调用的 `SKILL.md`。

## 是否允许安装

允许安装当前手动版。