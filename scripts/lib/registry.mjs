import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function getRoot() {
  return root;
}

export function readJson(relativePath) {
  const raw = fs.readFileSync(path.join(root, relativePath), "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

export function writeText(relativePath, content) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

export function ensureDir(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

export function loadSkillsRegistry() {
  return readJson("registry/skills.json");
}

export function loadCompatibilityRegistry() {
  return readJson("registry/compatibility.json");
}

export function loadSyncStateRegistry() {
  return readJson("registry/sync-state.json");
}

export function loadInstallProfilesRegistry() {
  return readJson("registry/install-profiles.json");
}

export function buildSkillRecords() {
  const skillsRegistry = loadSkillsRegistry();
  const compatibilityRegistry = loadCompatibilityRegistry();
  const syncRegistry = loadSyncStateRegistry();

  const compatibilityMap = new Map(compatibilityRegistry.entries.map((entry) => [entry.name, entry]));
  const syncMap = new Map(syncRegistry.entries.map((entry) => [entry.name, entry]));

  return skillsRegistry.skills.map((skill) => ({
    ...skill,
    compatibility: compatibilityMap.get(skill.name),
    syncState: syncMap.get(skill.name)
  }));
}

export function runtimeDir(runtime) {
  return runtime === "claude-code" ? "skills/claude-code" : runtime === "shared" ? "skills/shared" : "skills/codex";
}
