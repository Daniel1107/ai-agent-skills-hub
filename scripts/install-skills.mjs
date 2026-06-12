import path from "node:path";
import { buildSkillRecords, getRoot, loadInstallProfilesRegistry, runtimeDir } from "./lib/registry.mjs";

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const skills = buildSkillRecords();
const profiles = loadInstallProfilesRegistry().profiles;
const root = getRoot();

if (has("--help") || args.length === 0) {
  console.log(`Usage:
  node scripts/install-skills.mjs --runtime <codex|claude-code|shared> [--dry-run]
  node scripts/install-skills.mjs --profile <name> [--dry-run]
  node scripts/install-skills.mjs --skill <name> [--dry-run]
  node scripts/install-skills.mjs --all [--dry-run]`);
  process.exit(0);
}

let selected = [];
if (has("--all")) {
  selected = skills.filter((skill) => skill.enabled);
} else if (valueOf("--runtime")) {
  const runtime = valueOf("--runtime");
  selected = skills.filter((skill) => skill.compatibility.runtime === runtime && skill.enabled);
} else if (valueOf("--skill")) {
  const name = valueOf("--skill");
  selected = skills.filter((skill) => skill.name === name && skill.enabled);
} else if (valueOf("--profile")) {
  const profileName = valueOf("--profile");
  const profile = profiles.find((item) => item.name === profileName);
  if (!profile) {
    console.error(`Unknown profile: ${profileName}`);
    process.exit(1);
  }
  selected = skills.filter((skill) => {
    if (!skill.enabled) return false;
    if (profile.runtimes && !profile.runtimes.includes(skill.compatibility.runtime)) return false;
    if (profile.categories && !profile.categories.includes(skill.category)) return false;
    if (profile.includeRisks && !profile.includeRisks.includes(skill.risk)) return false;
    if (profile.excludeInstallModes && profile.excludeInstallModes.includes(skill.installMode)) return false;
    return true;
  });
}

if (selected.length === 0) {
  console.error("No skills matched the requested selector.");
  process.exit(1);
}

const dryRun = has("--dry-run");
for (const skill of selected) {
  const localTarget = path.join(root, runtimeDir(skill.compatibility.runtime), skill.slug);
  const installCommand = `npx skills add ${localTarget} --skill ${skill.slug}`;
  console.log(`\n[${skill.name}]`);
  console.log(`runtime=${skill.compatibility.runtime}`);
  console.log(`source=${skill.upstreamRepo}`);
  console.log(`local=${localTarget}`);
  console.log(`install=${installCommand}`);
  if (!dryRun) {
    console.log(`Install execution is intentionally disabled until the mirror sync phase has materialized the real skill artifacts for ${skill.name}.`);
  }
}
