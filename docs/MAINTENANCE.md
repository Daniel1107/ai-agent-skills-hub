# 维护流程

## 常规变更

1. 修改 `skills.json`。
2. 运行 `node scripts/validate-manifest.mjs`。
3. 运行 `node scripts/generate-readmes.mjs`。
4. 检查 Git diff。
5. 提交变更。

## 增加新 Skill

必须补齐字段：

- `name`
- `category`
- `sourceLevel`
- `source`
- `installType`
- `installCommand`
- `risk`
- `status`

## 镜像源码条件

只有同时满足以下条件，才建议把第三方 Skill 源码镜像进本仓库：

1. 常用且长期依赖。
2. 来源许可证允许再分发。
3. 已完成安全审计。
4. 已确认维护责任。
5. 已有明确更新策略。

