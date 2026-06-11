import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "skills.json"), "utf8"));
const skillsRoot = path.join(root, "skills");

for (const [category, label] of Object.entries(manifest.categories)) {
  const categoryDir = path.join(skillsRoot, category);
  fs.mkdirSync(categoryDir, { recursive: true });
  const categorySkills = manifest.skills.filter((skill) => skill.category === category);
  const categoryReadme = [
    `# ${label}`,
    "",
    "| Skill | 来源等级 | 风险 | 安装类型 |",
    "|---|---|---|---|",
    ...categorySkills.map((skill) => `| [${skill.name}](${skill.name}/README.md) | ${skill.sourceLevel} | ${skill.risk} | ${skill.installType} |`),
    ""
  ].join("\n");
  fs.writeFileSync(path.join(categoryDir, "README.md"), categoryReadme, "utf8");

  for (const skill of categorySkills) {
    const skillDir = path.join(categoryDir, skill.name);
    fs.mkdirSync(skillDir, { recursive: true });
    const readme = [
      `# ${skill.name}`,
      "",
      `- 分类：${manifest.categories[skill.category]} (${skill.category})`,
      `- 来源等级：${skill.sourceLevel}`,
      `- 来源地址：${skill.source}`,
      `- 安装类型：${skill.installType}`,
      `- 风险等级：${skill.risk}`,
      `- 当前状态：${skill.status}`,
      "",
      "## 推荐安装命令",
      "",
      "```bash",
      skill.installCommand,
      "```",
      "",
      "## 维护要求",
      "",
      "1. 安装前先确认来源仓库、提交历史、许可证和脚本权限。",
      "2. 高风险 Skill 必须先在隔离环境试装。",
      "3. 若来源迁移到 OpenAI 官方插件仓库，优先更新 `skills.json` 的 `sourceLevel` 和 `source`。",
      "4. 不在本目录保存 Token、Cookie、私钥或账户凭据。",
      ""
    ].join("\n");
    fs.writeFileSync(path.join(skillDir, "README.md"), readme, "utf8");
  }
}

console.log(`Generated README files for ${manifest.skills.length} skills.`);
