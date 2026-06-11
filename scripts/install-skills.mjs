import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "skills.json"), "utf8"));
const args = process.argv.slice(2);

const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

if (has("--help") || args.length === 0) {
  console.log(`Usage:
  node scripts/install-skills.mjs --all [--dry-run]
  node scripts/install-skills.mjs --category <category> [--dry-run]
  node scripts/install-skills.mjs --skill <name> [--dry-run]

Categories:
  ${Object.keys(manifest.categories).join("\n  ")}`);
  process.exit(0);
}

let selected = [];
if (has("--all")) {
  selected = manifest.skills;
} else if (valueOf("--category")) {
  const category = valueOf("--category");
  selected = manifest.skills.filter((skill) => skill.category === category);
} else if (valueOf("--skill")) {
  const name = valueOf("--skill");
  selected = manifest.skills.filter((skill) => skill.name === name);
}

if (selected.length === 0) {
  console.error("No skills matched the requested selector.");
  process.exit(1);
}

const dryRun = has("--dry-run");
for (const skill of selected) {
  console.log(`\n[${skill.name}] ${skill.installCommand}`);
  if (skill.installType !== "npx-skills") {
    console.log(`Manual install required: ${skill.installType}`);
    continue;
  }
  if (dryRun) continue;

  const parts = skill.installCommand.split(" ");
  const result = spawnSync(parts[0], parts.slice(1), { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`Install failed: ${skill.name}`);
    process.exit(result.status ?? 1);
  }
}
