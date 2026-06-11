#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/install-by-category.sh <category> [--dry-run]"
  echo "Categories: document-automation dev-engineering agent-collaboration specialized-media-context"
  exit 1
fi

category="$1"
shift
node scripts/install-skills.mjs --category "$category" "$@"

