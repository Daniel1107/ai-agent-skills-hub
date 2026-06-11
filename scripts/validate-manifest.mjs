import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "skills.json"), "utf8"));
const names = new Set();
const errors = [];

for (const skill of manifest.skills) {
  for (const field of ["name", "category", "sourceLevel", "source", "installType", "installCommand", "risk", "status"]) {
    if (!skill[field]) errors.push(`${skill.name ?? "<unknown>"} missing ${field}`);
  }
  if (names.has(skill.name)) errors.push(`duplicate skill name: ${skill.name}`);
  names.add(skill.name);
  if (!manifest.categories[skill.category]) errors.push(`${skill.name} has unknown category: ${skill.category}`);
  if (!["openai-priority", "external-fallback", "lobehub"].includes(skill.sourceLevel)) errors.push(`${skill.name} has invalid sourceLevel`);
  if (!["low", "medium", "high"].includes(skill.risk)) errors.push(`${skill.name} has invalid risk`);
}

if (manifest.skills.length !== 31) {
  errors.push(`expected 31 skills, got ${manifest.skills.length}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Manifest valid: ${manifest.skills.length} skills.`);
