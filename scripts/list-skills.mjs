import { buildSkillRecords } from "./lib/registry.mjs";

const rows = buildSkillRecords().map((skill) => ({
  name: skill.name,
  runtime: skill.compatibility.runtime,
  confidence: skill.compatibility.confidence,
  category: skill.category,
  syncMode: skill.syncMode,
  installMode: skill.installMode,
  risk: skill.risk
}));

console.table(rows);
console.log(`Total: ${rows.length}`);
