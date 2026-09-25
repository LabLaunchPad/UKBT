# artifacts/ — evidence and receipts, never rules

Local rules for the evidence layer. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds directory-local detail.

## Scope

`<root>/artifacts/` records what happened; `contracts/`, `CLAUDE.md`, `AGENTS.md`, `docs/` say what should (`README.md:3-5`). 20 subdirectories + 7 top-level files (this file, `README.md`, `HANDOFF.md`, `negative-cases-matrix.md`, `STAGE_7_READINESS_MATRIX.md`, `tina-audit-fixes-plan.md`, `ukbt-10-iteration-hardening-plan.md`). `README.md`'s 7-row table is STALE (lists 7 dirs; 20 exist) — the listing below was recounted from source.

## Role

Append-only memory: evidence records, verification receipts, review output, adaptive-learning catalog. Consumers: agents grounding decisions, auditors tracing claims, release gates checking freshness. Precedence: `docs/09-repository-reconciliation.md § 2`.

## Source of Truth

- Layer role: `README.md` (records, never rules) + `knowledge/00-KNOWLEDGE-CONTRACT.md`
- Evidence registry rules: `knowledge/04-EVIDENCE-POLICY.yaml` (`EV-YYYYMMDD-NNN`, append-only, supersede-by-new-record)
- Canonical status: `docs/12-roadmap-and-open-items.md` + `knowledge/01-VERIFIED-FACTS.yaml` + fresh `receipts/RELEASE.md`

## Structure

- `evidence/` — `EV-…` records, populated and append-only (51 `EV-*.yaml` + 4 ADELUX verification docs + 2 firewall/checklist notes + 1 `.gitkeep` = 58 tracked files at HEAD)
- `receipts/` — `FOUNDATION.md`, `HOMEPAGE.md`, `RELEASE.md`; each asserts real exit codes + the command that produced them, or it is not a receipt
- `review/` — `HOMEPAGE-REDTEAM.md`, `replay.md`, `LEGACY-ABOUT-INVENTORY.md`, finding-level remediations (`F3-…`, `F4-F8-…`, `F6-…`, `MOBILE-…`)
- `adaptive-learning/` — prompt-07 schema: `ERROR-CATALOG.md`, `PREVENTION-CHECKLIST.md`, `RECURRENCE-PROTOCOL.md`, `INDEX.yaml`; scan the index before non-trivial work, quote the catalog ID on recurrence
- `content/` — client-blocked asks: `CLIENT-ASK-LIST.md`, `CLIENT-REQUIREMENTS-INVENTORY.md`, `UKBT-CONTENT-INVENTORY.md`
- `visual/` (`DECISION-LEDGER.md`), `responsive/` (`RESPONSIVE-MATRIX.yaml`), `renders/` (`RENDER-FINGERPRINT.md`) — governed visual artifacts; old baselines are history, not current truth (ADELUX files live in `adelux/`, `design/`, `evidence/`, not `visual/`)
- `bootstrap/`, `verification/`, `ui/`, `pages/`, `architecture/`, `design/`, `audit/` — stage evidence (original stage mapping in `README.md`)
- `adelux/`, `audit/`, `brand/`, `extraction/`, `performance/`, `source/` — domain evidence stores
- `HANDOFF.md` — living handoff doc, refreshed 2026-09-25 (frozen 2026-09-15 section kept verbatim below as history per its in-file flag + D-18 rewrite ruling)

## Dependencies

`knowledge/` links to records here by ID; `docs/12` cites receipts here. Nothing inverts: artifacts never authorize, only attest.

## Allowed

- Appending new evidence records, fresh receipts, new review findings, new catalog entries
- Adding a superseding record that reclassifies an old one as `SUPERSEDED` with a pointer

## Protected / Generated

- Historical records stay verbatim: never edit an old receipt, red-team finding, or the frozen 2026-09-15 `HANDOFF.md` section below (living top refreshed 2026-09-25) — write a new dated record instead.
- Receipts record fresh runs only: `RELEASE.md` must reflect a fresh `deploy:verify`; a previous PASS is not a current PASS.
- Governed visual artifacts (`visual/`, `responsive/`, `renders/`): replace by re-running the governed process, not by hand-editing.

## Conventions

- Per-category editability: `evidence/` append-only · `receipts/` fresh-runs-only · `review/` append findings + remediations · `adaptive-learning/` catalog+checklist+protocol schema · `content/` client asks stay open until the client answers · visual/responsive/renders governed, never hand-tweaked.
- Every claim traceable: record ID, source, retrieval time, exit status where applicable.

## Validation

```bash
pnpm deploy:verify    # regenerates receipts from repo root — receipts assert, this proves
```

Never claim a check passed unless executed with its exit status recorded in a fresh receipt.

## Failure Modes

- Editing an old receipt to match current state — destroys the audit trail; write a new one.
- Treating `HANDOFF.md` (2026-09-15) as current — it predates the full `.opencode/` tree and current roadmap; read `docs/12` for now.
- Citing an old screenshot/baseline as current visual truth — re-run per `knowledge/11` + `docs/13-visual-truth-system.md`.
- Trusting `README.md`'s 7-dir table as the full listing — it is stale; list the directory.

## Related

- Root `AGENTS.md` (adaptive-learning wiring, visual truth authority chain), `knowledge/AGENTS.md` (registry + promotion rules), `contracts/AGENTS.md` (what the evidence must satisfy)
- `docs/12-roadmap-and-open-items.md` (cites these receipts), `docs/13-visual-truth-system.md` (visual re-verification)

## Workflow

Do the work → append the dated record/receipt with commands + exit codes → cite its ID from `knowledge/` or `docs/12`. Evidence before synthesis, always.
