# AI Agent Skills Hub

集中管理 AI Agent 常用 Skill 的索引、安装入口、来源策略和安全审计状态。

本仓库目标不是盲目镜像第三方源码，而是先提供一个可信、可审计、可批量安装的 Skill Hub：

- 以 OpenAI `plugins` 仓库为优先来源。
- OpenAI 未确认的 Skill 使用原始清单中的外部来源。
- `skills.json` 作为唯一权威清单。
- `scripts/` 提供批量安装、分类安装、单项安装和 README 生成。
- `docs/` 记录来源策略、安全审计和维护流程。

## 快速使用

### 1. 查看全部 Skill

```powershell
node scripts/list-skills.mjs
```

### 2. 安装全部 Skill

```powershell
node scripts/install-skills.mjs --all
```

### 3. 按分类安装

```powershell
node scripts/install-skills.mjs --category document-automation
node scripts/install-skills.mjs --category dev-engineering
node scripts/install-skills.mjs --category agent-collaboration
node scripts/install-skills.mjs --category specialized-media-context
```

### 4. 安装单个 Skill

```powershell
node scripts/install-skills.mjs --skill superpowers
node scripts/install-skills.mjs --skill ppt-master
```

### 5. 只预览命令，不执行

```powershell
node scripts/install-skills.mjs --all --dry-run
```

## 分类

| 分类 | 目录 | 说明 |
|---|---|---|
| Document Automation | `skills/document-automation/` | 文档、PPT、PDF、表格、转换处理 |
| Dev Engineering | `skills/dev-engineering/` | 编码、全栈、GitHub、网络诊断、可视化 |
| Agent Collaboration | `skills/agent-collaboration/` | Agent 协作、浏览器、Skill 创建、安全审计、Superpowers |
| Specialized Media Context | `skills/specialized-media-context/` | 图像、音频、文本优化、财务报表、商业验证 |

## 来源等级

| 等级 | 含义 |
|---|---|
| openai-priority | OpenAI `plugins` 优先源或用户明确指定的 OpenAI 插件地址 |
| external-fallback | OpenAI 源未确认，使用外部 GitHub 来源 |
| lobehub | 使用 LobeHub skill.md 安装说明 |

## 安全原则

安装前先阅读：

- [来源策略](docs/SOURCE_POLICY.md)
- [安全审计](docs/SECURITY_REVIEW.md)
- [维护流程](docs/MAINTENANCE.md)

高风险 Skill 不建议直接全量安装到生产环境，尤其是浏览器自动化、Shell/代码执行、GitHub 写入、联网上传、自我修改类 Skill。

## 生成 Skill README

每个 Skill 的 README 由 `skills.json` 生成：

```powershell
node scripts/generate-readmes.mjs
```

## 当前收录

当前收录 31 个 Skill。完整列表见 [skills.json](skills.json)。

