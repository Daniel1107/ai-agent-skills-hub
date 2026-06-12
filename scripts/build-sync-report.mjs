import { buildSkillRecords, writeText } from "./lib/registry.mjs";

const skills = buildSkillRecords().sort((a, b) => a.name.localeCompare(b.name));

const lines = [
  "# Sync Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| Skill | Runtime | Enabled | Sync Status | Commit | Source | Path |",
  "|---|---|---|---|---|---|---|",
  ...skills.map((skill) => `| ${skill.name} | ${skill.compatibility.runtime} | ${skill.enabled} | ${skill.syncState.syncStatus} | ${skill.syncState.lastSyncedCommit ?? ""} | ${skill.upstreamRepo} | ${skill.upstreamPath} |`),
  ""
];

writeText("reports/sync-report.md", lines.join("\n"));
console.log(`Sync report generated for ${skills.length} skills.`);
