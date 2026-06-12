import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { buildSkillRecords, getRoot, loadSyncStateRegistry, runtimeDir, writeText } from "./lib/registry.mjs";

const root = getRoot();
const cacheRoot = path.join(root, "upstream-cache");
const gitExecutable = "C:\\Program Files\\Git\\cmd\\git.exe";

main();

function valueOf(flag, args) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function main() {
  try {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const skillName = valueOf("--skill", args);
    const targetSkills = buildSkillRecords()
      .filter((skill) => !skillName || skill.name === skillName)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (targetSkills.length === 0) {
      console.error("No skills matched sync selector.");
      process.exit(1);
    }

    if (!dryRun) {
      fs.mkdirSync(cacheRoot, { recursive: true });
    }

    const syncRegistry = loadSyncStateRegistry();
    const syncMap = new Map(syncRegistry.entries.map((entry) => [entry.name, entry]));
    const reportRows = [];

    for (const skill of targetSkills) {
      const targetDir = path.join(root, runtimeDir(skill.compatibility.runtime), skill.slug);
      let status = "planned";
      let commit = null;
      try {
        if (dryRun) {
          status = "planned";
        } else if (skill.syncMode === "remote-manifest") {
          syncRemoteManifest(skill, targetDir);
          status = "synced";
        } else {
          const repoState = materializeRepo(skill);
          commit = repoState.commit;
          mirrorRepoSkill(skill, repoState.repoDir, targetDir);
          status = "synced";
        }
        if (!dryRun) {
          writeMirrorMetadata(skill, targetDir, commit);
          const state = syncMap.get(skill.name);
          if (!state) throw new Error(`sync-state missing for ${skill.name}`);
          state.syncStatus = status;
          state.lastSyncedAt = new Date().toISOString();
          state.lastSyncedCommit = commit;
        }
      } catch (error) {
        status = `failed: ${error.message}`;
        if (!dryRun) {
          const state = syncMap.get(skill.name);
          if (state) {
            state.syncStatus = "failed";
            state.lastSyncedAt = new Date().toISOString();
          }
        }
      }

      reportRows.push(`| ${skill.name} | ${skill.compatibility.runtime} | ${skill.syncMode} | ${skill.upstreamRepo} | ${skill.upstreamPath} | ${status} |`);
      console.log(`[${skill.name}] ${status}`);
    }

    if (!dryRun) {
      const updatedState = {
        ...syncRegistry,
        updatedAt: new Date().toISOString(),
        entries: Array.from(syncMap.values())
      };
      fs.writeFileSync(path.join(root, "registry", "sync-state.json"), JSON.stringify(updatedState, null, 2), "utf8");
    }

    const reportLines = [
      "# Sync Report",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "| Skill | Runtime | Sync Mode | Upstream Repo | Upstream Path | Status |",
      "|---|---|---|---|---|---|",
      ...reportRows,
      ""
    ];
    writeText("reports/sync-report.md", reportLines.join("\n"));

    console.log(dryRun ? `Dry-run planned ${targetSkills.length} sync actions.` : `Synced ${targetSkills.length} skills.`);
  } catch (error) {
    console.error(`sync-skills fatal: ${error.stack || error.message}`);
    process.exit(1);
  }
}

function safeRepoDir(repoUrl) {
  const hash = crypto.createHash("sha1").update(repoUrl).digest("hex").slice(0, 10);
  const slug = repoUrl.split("/").slice(-2).join("-").replace(/\.git$/i, "");
  return path.join(cacheRoot, `${slug}-${hash}`);
}

function runGit(commandArgs, workdir = root) {
  const result = spawnSync(gitExecutable, commandArgs, { cwd: workdir, encoding: "utf8" });
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "git command failed").trim());
  }
  return result.stdout.trim();
}

function materializeRepo(skill) {
  const repoDir = safeRepoDir(skill.upstreamRepo);
  const refresh = process.argv.includes("--refresh");
  if (!fs.existsSync(repoDir) || refresh) {
    fs.rmSync(repoDir, { recursive: true, force: true });
    runGit(["clone", "--depth", "1", "--branch", skill.defaultBranch, skill.upstreamRepo, repoDir]);
  }
  const commit = runGit(["rev-parse", "HEAD"], repoDir);
  return { repoDir, commit };
}

function mirrorRepoSkill(skill, repoDir, targetDir) {
  const sourceDir = skill.syncMode === "repo-root-skill" ? repoDir : path.join(repoDir, skill.upstreamPath);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`upstream path not found: ${skill.upstreamPath}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(targetDir)) {
    if (entry === "HUB.md") continue;
    fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true }).filter((entry) => entry.name !== ".git");
  for (const entry of entries) {
    fs.cpSync(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), { recursive: true });
  }
}

function syncRemoteManifest(skill, targetDir) {
  const response = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Invoke-WebRequest -Uri '${skill.upstreamRepo}' -UseBasicParsing | Select-Object -ExpandProperty Content`
    ],
    { encoding: "utf8" }
  );
  if (response.status !== 0) {
    throw new Error((response.stderr || response.stdout || "remote fetch failed").trim());
  }

  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(targetDir)) {
    if (entry === "HUB.md") continue;
    fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
  }
  fs.writeFileSync(path.join(targetDir, "SKILL.md"), response.stdout, "utf8");
}

function writeMirrorMetadata(skill, targetDir, commit) {
  const metadata = {
    name: skill.name,
    runtime: skill.compatibility.runtime,
    upstreamRepo: skill.upstreamRepo,
    upstreamPath: skill.upstreamPath,
    syncMode: skill.syncMode,
    syncedAt: new Date().toISOString(),
    lastSyncedCommit: commit
  };
  fs.writeFileSync(path.join(targetDir, "MIRROR.json"), JSON.stringify(metadata, null, 2), "utf8");
}
