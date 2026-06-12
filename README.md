# AI Agent Skills Hub

Self-hosted Skill Hub for `Codex` and `Claude Code`.

This repository is being upgraded from a link index into a mirror-oriented hub:

- Mirror and track real upstream Skill artifacts
- Separate skills by `codex`, `claude-code`, and `shared`
- Track upstream sync state by version, tag, or commit SHA
- Keep add/remove/update operations registry-driven

## Registry

The repository now uses a registry-driven layout:

- `registry/skills.json`
- `registry/compatibility.json`
- `registry/sync-state.json`
- `registry/install-profiles.json`

Generated runtime folders:

- `skills/codex/`
- `skills/claude-code/`
- `skills/shared/`

## Commands

List skills:

```powershell
node scripts/list-skills.mjs
```

Validate registry:

```powershell
node scripts/validate-registry.mjs
```

Generate runtime README files:

```powershell
node scripts/generate-readmes.mjs
```

Generate compatibility report:

```powershell
node scripts/classify-skills.mjs
```

Preview sync actions:

```powershell
node scripts/sync-skills.mjs --dry-run
```

Preview install commands:

```powershell
node scripts/install-skills.mjs --runtime codex --dry-run
node scripts/install-skills.mjs --runtime claude-code --dry-run
node scripts/install-skills.mjs --profile safe-default --dry-run
```

## Notes

- Upstream version tracking is best-effort. If a source has no semantic version, the hub will track tag or commit SHA instead.
- Runtime classification is intentionally pragmatic. If a skill is judged runnable, it is assigned to `codex` or `claude-code` rather than defaulting to `shared`.
- Future add/remove/update operations should start from the registry files, not manual folder edits.
