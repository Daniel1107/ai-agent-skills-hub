#!/usr/bin/env bash
set -euo pipefail

runtime="${1:-codex}"
shift || true
node scripts/install-skills.mjs --runtime "$runtime" "$@"
