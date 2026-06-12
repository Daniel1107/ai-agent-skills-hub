# Maintenance

## Normal change flow

1. Edit `registry/skills.json`, `registry/compatibility.json`, `registry/sync-state.json`, or `registry/install-profiles.json`.
2. Run `node scripts/validate-registry.mjs`.
3. Run `node scripts/generate-readmes.mjs`.
4. Run `node scripts/classify-skills.mjs`.
5. Run `node scripts/sync-skills.mjs --dry-run`.
6. Review Git diff.
7. Commit.

## Adding a new skill

You must add:

- a skill entry in `registry/skills.json`
- a compatibility entry in `registry/compatibility.json`
- a sync-state entry in `registry/sync-state.json`
- optional profile coverage in `registry/install-profiles.json`

Required fields in `registry/skills.json`:

- `name`
- `slug`
- `category`
- `sourceLevel`
- `upstreamRepo`
- `upstreamPath`
- `defaultBranch`
- `syncMode`
- `installMode`
- `risk`
- `enabled`

## Removing or disabling a skill

- Preferred: set `enabled` to `false` first
- Remove the skill entirely only after registry and generated outputs have been updated together

## Mirror policy

Mirror upstream Skill content only when:

1. the source license allows redistribution
2. the sync source is stable enough to automate
3. the risk profile is understood
4. the runtime classification is recorded
