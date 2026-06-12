#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/install-by-category.sh <profile> [--dry-run]"
  exit 1
fi

profile="$1"
shift
node scripts/install-skills.mjs --profile "$profile" "$@"
