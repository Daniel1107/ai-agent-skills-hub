import { buildSkillRecords, writeText } from "./lib/registry.mjs";

const skills = buildSkillRecords().sort((a, b) => {
  const runtimeOrder = ["codex", "claude-code", "shared"];
  const runtimeDiff = runtimeOrder.indexOf(a.compatibility.runtime) - runtimeOrder.indexOf(b.compatibility.runtime);
  return runtimeDiff !== 0 ? runtimeDiff : a.name.localeCompare(b.name);
});

const lines = [
  "# Compatibility Report",
  "",
  "| Skill | Runtime | Confidence | Reason |",
  "|---|---|---|---|",
  ...skills.map((skill) => `| ${skill.name} | ${skill.compatibility.runtime} | ${skill.compatibility.confidence} | ${skill.compatibility.reason} |`),
  ""
];

writeText("reports/compatibility-report.md", lines.join("\n"));
console.log(`Compatibility report generated for ${skills.length} skills.`);
