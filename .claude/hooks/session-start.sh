#!/bin/bash
set -euo pipefail

# Only needed for Claude Code on the web — local sessions manage their own
# environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# pnpm workspace (apps/web = Astro, packages/truth = content/truth-gate).
# `pnpm install` (not --frozen-lockfile) so the cached container state can be
# reused across sessions; it's idempotent and no-ops when already satisfied.
pnpm install
