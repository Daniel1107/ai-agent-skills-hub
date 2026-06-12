import fs from "node:fs";
import path from "node:path";
import { buildSkillRecords, ensureDir, getRoot, runtimeDir, writeText } from "./lib/registry.mjs";

const root = getRoot();
const skills = buildSkillRecords();
const runtimes = ["codex", "claude-code", "shared"];
const legacyDirs = [
  "skills/document-automation",
  "skills/dev-engineering",
  "skills/agent-collaboration",
  "skills/specialized-media-context"
];

for (const legacyDir of legacyDirs) {
  fs.rmSync(path.join(root, legacyDir), { recursive: true, force: true });
}

for (const runtime of runtimes) {
  ensureDir(runtimeDir(runtime));
}

for (const runtime of runtimes) {
  const runtimeSkills = skills.filter((skill) => skill.compatibility.runtime === runtime).sort((a, b) => a.name.localeCompare(b.name));
  const indexLines = [
    `# ${runtime}`,
    "",
    "| Skill | Category | Risk | Sync Mode | Install Mode |",
    "|---|---|---|---|---|",
    ...runtimeSkills.map((skill) => `| [${skill.name}](${skill.slug}/HUB.md) | ${skill.category} | ${skill.risk} | ${skill.syncMode} | ${skill.installMode} |`),
    ""
  ];
  writeText(`${runtimeDir(runtime)}/README.md`, indexLines.join("\n"));

  for (const skill of runtimeSkills) {
    const skillDir = `${runtimeDir(runtime)}/${skill.slug}`;
    ensureDir(skillDir);
    const readme = [
      `# ${skill.name}`,
      "",
      `- Runtime: ${skill.compatibility.runtime}`,
      `- Confidence: ${skill.compatibility.confidence}`,
      `- Category: ${skill.category}`,
      `- Source Level: ${skill.sourceLevel}`,
      `- Upstream Repo: ${skill.upstreamRepo}`,
      `- Upstream Path: ${skill.upstreamPath}`,
      `- Sync Mode: ${skill.syncMode}`,
      `- Install Mode: ${skill.installMode}`,
      `- Risk: ${skill.risk}`,
      `- Enabled: ${skill.enabled}`,
      `- Sync Status: ${skill.syncState.syncStatus}`,
      ...(skill.sourceNote ? [`- Source Note: ${skill.sourceNote}`] : []),
      "",
      "## Compatibility",
      "",
      skill.compatibility.reason,
      "",
      "## Signals",
      "",
      ...skill.compatibility.signals.map((signal) => `- ${signal}`),
      "",
      "## Self-Hosted Target",
      "",
      `This skill will be mirrored into \`${skillDir}\` and installed from the local repository mirror after sync.`,
      ""
    ].join("\n");
    writeText(`${skillDir}/HUB.md`, readme);
  }
}

console.log(`Generated runtime README files for ${skills.length} skills.`);
