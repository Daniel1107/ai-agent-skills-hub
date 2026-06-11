# 来源策略

## 核心原则

1. 优先检索 OpenAI `plugins` 仓库：`https://github.com/openai/plugins/tree/main/plugins`。
2. OpenAI 源未确认时，使用原始清单提供的外部 GitHub 或 LobeHub 地址。
3. `superpowers` 明确保留 OpenAI 官方插件地址：`https://github.com/openai/plugins/tree/main/plugins/superpowers`。
4. 本仓库先做集中索引和安装入口，不默认镜像第三方源码。
5. 任何镜像行为必须先通过安全审计、许可证确认和维护责任确认。

## 来源等级

| sourceLevel | 说明 |
|---|---|
| openai-priority | OpenAI 优先源或用户明确指定的 OpenAI 插件地址 |
| external-fallback | OpenAI 未确认，使用外部来源 |
| lobehub | 使用 LobeHub `skill.md` 说明安装 |

## 更新规则

更新某个 Skill 来源时，只修改 `skills.json`，然后执行：

```powershell
node scripts/validate-manifest.mjs
node scripts/generate-readmes.mjs
```

