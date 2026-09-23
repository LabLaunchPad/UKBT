# UKBT — UK Bangla Tigers

Repository for the UK Bangla Tigers website.

**Status: active build.** A real, governed multi-page site exists
(`apps/web`) and is being extended stage by stage. This line is
intentionally the only status claim in this file — see "Current state"
below for why, and where the real numbers live instead.

## Working here

Read in this order:

| File | What it gives you |
|---|---|
| `CLAUDE.md` | operating contract, authority order, hard invariants |
| **`knowledge/`** | **compact decision substrate — read before any project-level decision** |
| `AGENTS.md` | evidence and role doctrine |
| `docs/10-fresh-repo-pipeline.md` | **the build order and the gate for each stage** |
| `contracts/` | frozen, machine-checkable agreements |
| `artifacts/bootstrap/` | current discovery output |

## The two rules that matter most

1. **No organization-specific claim about UK Bangla Tigers may be published
   without a sourced evidence record.** Not players, fixtures, history,
   leadership, honours, sponsors, venues, or contact details. `UNKNOWN` is a
   complete and acceptable answer; a plausible guess is not.
2. **No stage skipping.** Architecture is frozen at Stage 3, after a red team —
   not before. Pages are built one at a time, each with its own verification
   receipt.

## Current state

This file does not restate stage/gate numbers — three separate documents
in this repository (this file included) were once found to have drifted
out of date the same way, silently, because status was hand-copied into
several places instead of living in one. Read the real, current state
from whichever of these actually answers your question:

| Question | Where the current answer lives |
|---|---|
| What stage is the project at, and what's the gate for each? | `docs/10-fresh-repo-pipeline.md` |
| What's actually verified vs. still `UNKNOWN`? | `knowledge/01-VERIFIED-FACTS.yaml` |
| Did the last build/test/accessibility pass actually run, and pass? | `artifacts/receipts/` (`FOUNDATION.md`, `HOMEPAGE.md`, `RELEASE.md`) |
| Did an independent review find anything? | `artifacts/review/` (`HOMEPAGE-REDTEAM.md`, `replay.md`) |
| What's blocked on the client, not on engineering? | `artifacts/content/CLIENT-ASK-LIST.md` |

Scaffold integrity check: `node scripts/scaffold-self-test.mjs`
