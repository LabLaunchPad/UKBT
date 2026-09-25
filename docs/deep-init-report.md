# Deep Init Report — UKBT repository, 2026-09-25

Branch `feat/deep-init` → main. Docs/context only; zero app-behavior changes (`git diff --name-only` = `.md` only). Reviews: per-area gates + fix rounds + final review, all clean.

## Repository

pnpm monorepo (`apps/web` Astro 7 site + `packages/truth` `@ukbt/truth`), Cloudflare Workers deploy, TinaCMS editorial layer, 18-step `pnpm deploy:verify`, 20 CI jobs (18 required). Evidence-gated: Zod schemas + provenance gate before pixels.

## Architecture Discovered

Truth flows source evidence → `@ukbt/truth` gate/schema → typed `src/content/*-data.ts` → Astro render; parallel Tina editorial path (JSON + `TinaIsland`, NOT truth-gated, bound by content-trust/allowed-urls). Client JS: 4 component scripts, all ClientRouter-proofed with per-script lifecycle events + window guards. Output `dist/client/` + worker entry; sole on-demand route `tina-island/[name].ts`.

## Workspace Packages

| Package | Location | Role |
|---|---|---|
| `@ukbt/web` | `apps/web` | Astro static site, 18 routes + island endpoint |
| `@ukbt/truth` | `packages/truth` | Schemas, gate (`evaluate`/`isPublishable`), tokens |

## Agent Context Created

`packages/truth/AGENTS.md`, `apps/web/AGENTS.md`, `scripts/AGENTS.md`, `.github/AGENTS.md`, `tina/AGENTS.md`, `contracts/AGENTS.md`, `knowledge/AGENTS.md`, `artifacts/AGENTS.md`, `docs/AGENTS.md` (new, tailored, linked up); root `AGENTS.md` upgraded (navigation contract + verified counts).

## Indexes Created

None new — root `index.md` (OKF bundle) already indexes; local files point to it. Per §18, no unjustified files.

## Existing Context Preserved

Root `AGENTS.md`/`CLAUDE.md` authority chains, package `CLAUDE.md`s, contracts amendments, knowledge evidence links, Tina overlays — upgraded or cited, never rewritten.

## Important Source-of-Truth Boundaries

`docs/12-roadmap-and-open-items.md` (living status) · `knowledge/01-VERIFIED-FACTS.yaml` · `artifacts/receipts/` (fresh runs) · `contracts/` (frozen, amend-only) · `tina/__generated__/` (never edit) · UNKNOWN stays UNKNOWN.

## Verification Performed

- `pnpm lint` — clean, 88 files, no fixes.
- Per-area claim verification by reviewers against source (exports, counts, jobs, budgets, events, classes).
- No tests re-run (docs-only; CI owns gates on the PR).

## Contradictions / Risks Found

- Fixed here: root 16-gate order/counts, cssTotal 60→96KB, agents/skills counts, evidence classes 5→7, Tina versions/pins/CSP lines, stale Area A–C claims (events, parser, DR range, evidence/ population).
- Parked follow-ups: HANDOFF.md freeze (repo-sync Task 3), parked repo-sync Tasks 2–8, parity-checker gating decision, `ukbt-players-uiux-v2.md:63` 16-gate, Uppsala `r`-button latency, committed-spec visibility hardening.
- Risk noted: plan-record `.md` files embed dummy Tina env values (public client ID + dummy token — not secrets; flagged to avoid secret-scan noise).

## Recommended Follow-Up

Resume parked `feat/repo-sync` (Task 2 review → Tasks 3–8); decide HANDOFF refresh; rule on parity-checker gating; unpark deep-init leftovers above.
