# Self-Hosted Skill Hub Design

## Goal

把当前以来源索引为主的 `ai-agent-skills-hub` 改造成一个可直接安装、可自托管、可持续同步上游更新、并能区分 `Codex` 与 `Claude Code` 适配范围的 Skill Hub。

## Problem

当前仓库只保存 Skill 的来源地址、安装命令、分类和说明文件，不保存 Skill 实体目录。这会导致：

1. 本地安装仍依赖第三方原仓库。
2. 上游删除、重命名、改结构后，本仓库立即失效。
3. 无法实现“从自己的 GitHub 仓库直接安装”。
4. 无法对 `Codex` / `Claude Code` 的适配边界进行受控管理。

## Scope

本次改造覆盖以下内容：

1. 引入 Skill 实体镜像，而不是只保留 README 导航。
2. 为每个 Skill 记录上游仓库、上游子路径、同步方式和同步状态。
3. 将 Skill 镜像按 `codex`、`claude-code`、`shared` 三类落盘。
4. 建立自动同步脚本和同步状态记录。
5. 建立兼容性判定机制，优先把 Skill 归到 `codex` 或 `claude-code`。
6. 为后续新增、删除、禁用 Skill 预留清单驱动入口。

不在本次改造中完成的内容：

1. 不承诺所有上游都存在稳定语义化版本号。
2. 不做所有 Skill 的深度功能级运行测试。
3. 不做跨平台代理层编译器。

## Design Principles

### 1. 清单驱动

仓库不以手工拷贝为主，而以注册表清单驱动。新增或移除 Skill 时，优先修改注册表，再由脚本生成结构和报告。

### 2. 自托管优先

安装时默认优先使用本仓库内镜像的 Skill 实体，而不是原始外链。

### 3. 上游可追踪

每个 Skill 必须至少记录：

- `upstreamRepo`
- `upstreamPath`
- `syncMode`
- `upstreamRef`
- `lastSyncedCommit`
- `targetRuntime`

### 4. 兼容性保守但可执行

分类策略不追求理论最纯，而追求“尽量能跑”。只要合理判断可以在某载体运行，就优先归入 `codex` 或 `claude-code`。无法稳定归类时，才进入 `shared`。

### 5. 结构可扩展

仓库必须支持未来随时：

- 新增 Skill
- 下线 Skill
- 改变目标载体分类
- 改变同步来源
- 锁定某个上游提交

## Repository Layout

```text
ai-agent-skills-hub/
├─ registry/
│  ├─ skills.json
│  ├─ compatibility.json
│  ├─ sync-state.json
│  └─ install-profiles.json
├─ skills/
│  ├─ codex/
│  ├─ claude-code/
│  └─ shared/
├─ upstream-cache/
├─ scripts/
│  ├─ sync-skills.mjs
│  ├─ classify-skills.mjs
│  ├─ generate-readmes.mjs
│  ├─ install-skills.mjs
│  └─ validate-registry.mjs
├─ reports/
│  ├─ sync-report.md
│  └─ compatibility-report.md
└─ docs/
```

## Registry Model

### registry/skills.json

作为核心注册表，定义每个 Skill 的来源与目标信息。每项至少包含：

- `name`
- `slug`
- `category`
- `sourceLevel`
- `upstreamRepo`
- `upstreamPath`
- `defaultBranch`
- `syncMode`
- `installMode`
- `risk`
- `enabled`

### registry/compatibility.json

记录兼容性与分类判定：

- `runtime`: `codex` / `claude-code` / `shared`
- `confidence`: `high` / `medium` / `low`
- `reason`
- `signals`

### registry/sync-state.json

记录上次同步结果：

- `lastSyncedAt`
- `lastSyncedCommit`
- `upstreamTag`
- `upstreamVersion`
- `syncStatus`

### registry/install-profiles.json

定义安装集合，便于后续扩展：

- `codex-core`
- `claude-core`
- `documents`
- `automation-high-risk-excluded`

这就是未来“随时加减 Skill”的核心扩展位。

## Sync Strategy

### Modes

支持三类同步模式：

1. `repo-subdir`
从上游 Git 仓库拉取后，抽取某个子目录作为 Skill 实体。

2. `repo-root-skill`
上游仓库本身就是一个完整 Skill。

3. `remote-manifest`
上游是 `skill.md` 或类似单文件入口，抓取快照并落本地目录。

### Version Tracking

同步时按优先级记录：

1. `upstreamVersion`
2. `upstreamTag`
3. `lastSyncedCommit`

结论上不承诺“永远同步原作者版本号”，而承诺“永远同步到可验证的上游版本标识”。这是工程上真实可执行的表述。

## Compatibility Classification

### Target folders

- `skills/codex/`
- `skills/claude-code/`
- `skills/shared/`

### Classification policy

优先归类到 `codex` 或 `claude-code`，仅在以下情况才落 `shared`：

1. 指令明显与两端无关，且结构纯通用。
2. 没有足够信号支持单端归类。
3. 两端目录约定都可直接满足。

### Signals

判定依据包括：

1. 是否显式引用 `Codex`、`Claude Code`、`CLAUDE.md`、`AGENTS.md` 等平台要素。
2. 是否显式依赖某端工具名、执行模型、目录规则。
3. 是否使用纯 `SKILL.md + scripts + templates` 通用结构。
4. 是否可通过最小静态检查适配本端。

## Install Model

安装脚本必须优先从本仓库镜像目录安装，不再默认回源第三方仓库。

安装入口支持：

1. `--runtime codex`
2. `--runtime claude-code`
3. `--skill <name>`
4. `--profile <profile>`

## Reporting

每次同步后生成：

1. `reports/sync-report.md`
显示新增、更新、删除、失败项。

2. `reports/compatibility-report.md`
显示各 Skill 当前归类、置信度和判定依据。

## Risks

1. 上游目录结构变化会导致同步失败。
2. 某些 Skill 的“能跑”不等于“官方支持”。
3. 大仓库多子目录抽取可能引入重复或路径碰撞。
4. `LobeHub` 或网页型来源可能没有稳定版本结构。

## Success Criteria

满足以下条件视为改造完成：

1. 至少支持 31 个 Skill 的实体镜像入口。
2. 安装脚本默认从本仓库本地镜像安装。
3. 每个 Skill 都有同步元数据和兼容性元数据。
4. Skill 可分流到 `codex`、`claude-code`、`shared`。
5. 新增或移除一个 Skill 只需要改注册表并重新运行脚本。

