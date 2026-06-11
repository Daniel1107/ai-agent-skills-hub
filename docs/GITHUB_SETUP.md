# GitHub 创建与推送

推荐仓库：

```text
https://github.com/Daniel1107/ai-agent-skills-hub
```

## 安全注意

不要把 GitHub Token 写进：

- Git remote URL
- README
- `.env`
- PowerShell 历史命令
- issue / PR / commit message

## 方式一：网页创建仓库后推送

在 GitHub 网页新建：

```text
Owner: Daniel1107
Repository name: ai-agent-skills-hub
Visibility: Public 或 Private
```

然后执行：

```powershell
git remote add origin https://github.com/Daniel1107/ai-agent-skills-hub.git
git branch -M main
git push -u origin main
```

## 方式二：安装 GitHub CLI 后创建

```powershell
winget install --id GitHub.cli
gh auth login
gh repo create Daniel1107/ai-agent-skills-hub --private --source . --remote origin --push
```

