# Self-Hosted Skill Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted Skill Hub that mirrors Skill artifacts locally, tracks upstream sync state, and classifies skills by `codex`, `claude-code`, and `shared`.

**Architecture:** Replace the single manifest with a registry-driven pipeline. Registry files define source, sync, compatibility, and install profiles; scripts materialize mirrored skill directories, generate reports, and install from the local mirror rather than external links.

**Tech Stack:** Node.js, JSON registries, GitHub-hosted mirrored content, Markdown reports

---

### Task 1: Restructure Repository Metadata

**Files:**
- Create: `registry/skills.json`
- Create: `registry/compatibility.json`
- Create: `registry/sync-state.json`
- Create: `registry/install-profiles.json`
- Modify: `README.md`
- Modify: `docs/MAINTENANCE.md`
- Test: `scripts/validate-registry.mjs`

- [ ] **Step 1: Create the new registry files with initial schema**

- [ ] **Step 2: Migrate the existing 31 skills into `registry/skills.json`**

- [ ] **Step 3: Add initial runtime classification records into `registry/compatibility.json`**

- [ ] **Step 4: Add empty or seeded sync state into `registry/sync-state.json`**

- [ ] **Step 5: Add install profile definitions into `registry/install-profiles.json`**

- [ ] **Step 6: Rewrite `README.md` and maintenance docs around the new registry model**

- [ ] **Step 7: Implement `scripts/validate-registry.mjs` and verify registry integrity**

Run: `node scripts/validate-registry.mjs`
Expected: exit 0 with registry summary

### Task 2: Rebuild Skill Directory Model

**Files:**
- Create: `skills/codex/`
- Create: `skills/claude-code/`
- Create: `skills/shared/`
- Modify: `scripts/generate-readmes.mjs`
- Test: generated README files under the new tree

- [ ] **Step 1: Replace category-first generation with runtime-first generation**

- [ ] **Step 2: Generate per-runtime index pages**

- [ ] **Step 3: Generate per-skill README pages with upstream metadata and compatibility notes**

- [ ] **Step 4: Verify generated tree matches registry classification**

Run: `node scripts/generate-readmes.mjs`
Expected: generated runtime folder indexes and per-skill README files

### Task 3: Build Upstream Sync Pipeline

**Files:**
- Create: `scripts/sync-skills.mjs`
- Create: `reports/sync-report.md`
- Modify: `package.json`
- Test: sync dry-run output

- [ ] **Step 1: Implement registry loading and per-skill sync planning**

- [ ] **Step 2: Implement dry-run mode that prints exact sync actions**

- [ ] **Step 3: Implement `repo-root-skill`, `repo-subdir`, and `remote-manifest` sync handlers**

- [ ] **Step 4: Implement sync state updates and report generation**

- [ ] **Step 5: Verify dry-run against the 31 registered skills**

Run: `node scripts/sync-skills.mjs --dry-run`
Expected: 31 skills planned with source, target, and sync mode

### Task 4: Rebuild Install Pipeline

**Files:**
- Modify: `scripts/install-skills.mjs`
- Modify: `scripts/install-all.ps1`
- Modify: `scripts/install-by-category.ps1`
- Modify: `scripts/install-all.sh`
- Modify: `scripts/install-by-category.sh`
- Create: `scripts/classify-skills.mjs`
- Test: install dry-run output

- [ ] **Step 1: Replace category-only selectors with runtime/profile/skill selectors**

- [ ] **Step 2: Make install commands target local mirrored skill paths**

- [ ] **Step 3: Add `--runtime`, `--profile`, and `--skill` flags**

- [ ] **Step 4: Add runtime classification summary generation**

- [ ] **Step 5: Verify dry-run install output uses local repo targets**

Run: `node scripts/install-skills.mjs --runtime codex --dry-run`
Expected: commands point to local mirrored skill directories

### Task 5: Reporting and CI Validation

**Files:**
- Create: `reports/compatibility-report.md`
- Modify: `.github/workflows/validate.yml`
- Modify: `package.json`
- Test: validation workflow commands

- [ ] **Step 1: Generate compatibility report from registry data**

- [ ] **Step 2: Update CI to validate registry and generated outputs**

- [ ] **Step 3: Add a sync dry-run check to CI where safe**

- [ ] **Step 4: Verify local validation commands all succeed**

Run: `node scripts/validate-registry.mjs`
Expected: PASS

Run: `node scripts/generate-readmes.mjs`
Expected: PASS

Run: `node scripts/install-skills.mjs --runtime claude-code --dry-run`
Expected: PASS

### Task 6: Seed First-Pass Compatibility and Sync Metadata

**Files:**
- Modify: `registry/compatibility.json`
- Modify: `registry/sync-state.json`
- Create: `reports/compatibility-report.md`
- Test: generated reports

- [ ] **Step 1: Seed each of the 31 skills with first-pass runtime classification**

- [ ] **Step 2: Record classification confidence and reason fields**

- [ ] **Step 3: Seed sync-state placeholders for the first real sync pass**

- [ ] **Step 4: Generate compatibility report and review outliers**

Run: `node scripts/classify-skills.mjs`
Expected: report lists all 31 skills and their runtime buckets

