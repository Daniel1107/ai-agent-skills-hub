import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "skills.json"), "utf8"));

const rows = manifest.skills.map((skill) => ({
  name: skill.name,
  category: skill.category,
  source: skill.sourceLevel,
  risk: skill.risk,
  installType: skill.installType
}));

console.table(rows);
console.log(`Total: ${manifest.skills.length}`);
