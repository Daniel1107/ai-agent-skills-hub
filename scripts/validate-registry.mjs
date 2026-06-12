import { buildSkillRecords, loadCompatibilityRegistry, loadInstallProfilesRegistry, loadSkillsRegistry, loadSyncStateRegistry } from "./lib/registry.mjs";

const skillsRegistry = loadSkillsRegistry();
const compatibilityRegistry = loadCompatibilityRegistry();
const syncRegistry = loadSyncStateRegistry();
const profilesRegistry = loadInstallProfilesRegistry();
const skills = buildSkillRecords();
const errors = [];

if (skills.length !== 31) {
  errors.push(`expected 31 skills, got ${skills.length}`);
}

const names = new Set();
for (const skill of skillsRegistry.skills) {
  for (const field of ["name", "slug", "category", "sourceLevel", "upstreamRepo", "upstreamPath", "defaultBranch", "syncMode", "installMode", "risk", "enabled"]) {
    if (skill[field] === undefined || skill[field] === null || skill[field] === "") {
      errors.push(`${skill.name ?? "<unknown>"} missing ${field}`);
    }
  }
  if (names.has(skill.name)) errors.push(`duplicate skill name: ${skill.name}`);
  names.add(skill.name);
  if (!skillsRegistry.categories[skill.category]) errors.push(`${skill.name} has unknown category: ${skill.category}`);
  if (!skillsRegistry.sourceLevels.includes(skill.sourceLevel)) errors.push(`${skill.name} has invalid sourceLevel`);
  if (!skillsRegistry.syncModes.includes(skill.syncMode)) errors.push(`${skill.name} has invalid syncMode`);
  if (!skillsRegistry.installModes.includes(skill.installMode)) errors.push(`${skill.name} has invalid installMode`);
  if (!["low", "medium", "high"].includes(skill.risk)) errors.push(`${skill.name} has invalid risk`);
}

if (compatibilityRegistry.entries.length !== skills.length) {
  errors.push(`compatibility entry count mismatch: expected ${skills.length}, got ${compatibilityRegistry.entries.length}`);
}

if (syncRegistry.entries.length !== skills.length) {
  errors.push(`sync-state entry count mismatch: expected ${skills.length}, got ${syncRegistry.entries.length}`);
}

for (const skill of skills) {
  if (!skill.compatibility) errors.push(`${skill.name} missing compatibility entry`);
  if (!skill.syncState) errors.push(`${skill.name} missing sync-state entry`);
  if (skill.compatibility && !["codex", "claude-code", "shared"].includes(skill.compatibility.runtime)) {
    errors.push(`${skill.name} has invalid runtime: ${skill.compatibility.runtime}`);
  }
}

for (const profile of profilesRegistry.profiles) {
  if (!profile.name) errors.push("install profile missing name");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const runtimeCounts = skills.reduce((acc, skill) => {
  acc[skill.compatibility.runtime] = (acc[skill.compatibility.runtime] ?? 0) + 1;
  return acc;
}, {});

console.log(`Registry valid: ${skills.length} skills.`);
console.log(`Runtimes: codex=${runtimeCounts["codex"] ?? 0}, claude-code=${runtimeCounts["claude-code"] ?? 0}, shared=${runtimeCounts["shared"] ?? 0}`);
