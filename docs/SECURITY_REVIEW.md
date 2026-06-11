# 安全审计

## 风险分级

| 风险 | 类型 | 处理建议 |
|---|---|---|
| high | 浏览器自动化、Shell/代码执行、GitHub 写入、联网上传、自我修改、安全工具 | 隔离环境试装，人工审计源码和安装脚本 |
| medium | 文档生成、PPT、PDF、表格、网络诊断、可视化 | 先 dry-run，再试装，确认依赖和文件写入范围 |
| low | 纯文本处理、轻量分析类 | 可直接试装，但仍需检查来源和权限 |

## 高风险 Skill

- `agent-browser`
- `coding-agent`
- `fullstack-developer`
- `github`
- `skill-creator`
- `skill-vetter`
- `using-superpowers`
- `superpowers`
- `self-improvement`
- `harness`
- `openai-whisper`
- `baoyu-image-gen`

## 审计清单

安装前至少检查：

1. 来源仓库是否存在，是否与清单一致。
2. 最近提交是否异常。
3. `SKILL.md` 是否要求执行未知脚本、上传文件或读取敏感目录。
4. 是否包含 Token、Cookie、私钥、账户凭据读取逻辑。
5. 是否会修改全局配置、Shell profile、Git credential、浏览器配置。
6. 是否有网络上传、远程执行、任意命令执行能力。
7. 是否有明确许可证和维护者。

## 令牌规则

不得把 GitHub Token、API Key、Cookie、密码、验证码、私钥写入本仓库、日志、README 或 issue。

