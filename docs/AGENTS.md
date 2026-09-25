# docs/ — process, runbooks, and living status

Local rules for the docs layer. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds directory-local detail.

## Scope

`<root>/docs/` explains *how* to work. 18 top-level `.md` files + this file + 4 subdirs (`audit/`, `security/`, `superpowers/`, `tina-audit/`). Explanatory by default; exactly one file is canonical status.

## Role

Runbooks and stage/process definitions agents follow; the living status doc answers "what's done, what's next, what's blocked" without re-deriving it from receipts. `docs/` never overrides `contracts/` — a contract supersedes any prose restating it.

## Source of Truth

- Canonical status (the only one): `12-roadmap-and-open-items.md` — LIVING DOCUMENT, update in place, never fork (`12:3-4`, last updated 2026-09-23). Adds no new facts: every line cites the receipt/contract/CI run it comes from (`12:6-10`).
- Build order: `10-fresh-repo-pipeline.md` — stage/gate sequence; don't hand-roll a different one.
- Visual re-verification: `13-visual-truth-system.md` + `knowledge/11-VISUAL-TRUTH-POLICY.yaml`.

## Structure

- `12-roadmap-and-open-items.md` — living status (pipeline stages, findings, blockers); update in place
- `10-fresh-repo-pipeline.md` — authoritative build order; `11-github-branch-protection.md` — merge rules
- `tina-integration.md` — Tina runbook; `tina-client-guide.md` — client-facing CMS guide
- `13-visual-truth-system.md` — visual measurement/discipline; `14-tool-selection-layer.md` — tool selection
- `00-scaffold-overview.md` … `09-repository-reconciliation.md` — stage/process definitions (scaffold, gaps, boundaries, evidence/task contracts, resume, security, visual, critique); `09 § 2` sets artifacts precedence
- `adr-001-truth-lifecycle-publish.md` — architecture decision record; `audit/`, `security/`, `tina-audit/` — domain audits; `superpowers/` — plan scratch (untracked `plans/*.md` are working notes, not status)

## Dependencies

`12` cites `artifacts/receipts/`, `contracts/`, CI runs — it aggregates, never originates. Runbooks depend on `tina/config.ts` + adapter code; on drift, the config/code wins and the doc gets fixed.

## Allowed

- Updating `12` in place as stages/items close, with citations to the underlying receipt/contract/run
- Fixing runbooks when tooling changed (config/code authoritative — doc follows)
- Adding audit notes under the domain subdirs

## Protected / Generated

- `12`'s history: update, don't fork — a second status copy is a drift source. No target date appears unless the site owner set one (`12:12-14`).
- Nothing here is generated output; all of it is hand-maintained prose (which is why the anti-duplication rule matters).

## Conventions

- Authoritative vs explanatory: only `12` speaks status; everything else explains process. Volatile state (counts, gate results, dates) is linked (`12`, receipts, CI), never copied into sibling docs.
- Anti-duplication: link, don't copy — one live copy of every volatile fact; duplicates rot (precedent: `artifacts/README.md` 7-dir table vs 20 real dirs).
- UNKNOWN stays UNKNOWN: no invented dates, stats, or completions (`12:12`).

## Validation

```bash
pnpm deploy:verify    # status claims in 12 must match a fresh gate run, not memory
```

A `12` line without a cited receipt/contract/CI run is a gap in the document, not a new claim (`12:8-10`).

## Failure Modes

- Forking a second status doc instead of updating `12` — guaranteed drift.
- Copying gate results or counts into a runbook — they rot; link to `12`/receipts.
- Editing `contracts/` terms here instead of amending there by evidence record — the contract wins, the prose loses.
- Treating `superpowers/plans/*.md` scratch notes as decided status — working notes, not verdicts.

## Related

- Root `AGENTS.md` (pipeline overview, Tina integration), `contracts/AGENTS.md` (amendment authority), `knowledge/AGENTS.md` (fact discipline), `<root>/artifacts/AGENTS.md` (receipts `12` cites)

## Workflow

Do gated work → fresh receipt in `<root>/artifacts/receipts/` → update `12` in place with citation → runbooks follow code on drift.
