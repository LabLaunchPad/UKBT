# INCIDENT_02 — Admin dashboard loads, no visual (click-to-edit) feature anywhere
Date: 2026-09-18 | Reporter: owner (production) | Status: OPEN, expected — this is the known wiring gap, now user-confirmed

## Problem
After login, the normal TinaCloud dashboard (collections sidebar) shows, but no visual editing / click-to-edit preview appears on any page.

## Evidence
- Owner report 2026-09-18 (T0): "shows the normal tinacloud dashboards, not visual edit feature anywhere".
- Code audit (T1, fresh grep 2026-09-18): ZERO hits for `TinaIsland`, `requestWithMetadata`, `tinaField(` in apps/web/src. All `data-tina-field` markers are inert static strings (e.g. Hero.astro:81-82 `data-tina-field="headline"`).
- Islands dead code: `islands.ts` hero/aboutSection referenced only by `tina-island/[name].ts:2`; no page mounts them. Hero propsFromData lossy (drops headline/CTAs/heroImage) and static-JSON-backed.
- About page BLOCKER (not warning): markers name Tina fields but page renders truth-gate `about.*` with no loaders import — data-source divergence.
- Research (T2): hand-written `data-tina-field="literal"` is NOT enough; `tinaField()` output from `requestWithMetadata` metadata is required (SUPPORTED). `<TinaIsland>` + `requestWithMetadata` required; TinaIsland is the only path under `output: 'static'` (SUPPORTED). Collection sidebar/form editing works WITHOUT visual wiring; `ui.router` only changes link targets (SUPPORTED). So "dashboard loads, no visual edit" is fully explained — sidebar works on schema alone.
- Infra already sufficient: tina/config.ts routers, tina() integration, Cloudflare adapter, _headers Tina allowlist — pilot needs zero changes there.

## Root cause
Visual-editing page wiring was never implemented (deferred post-hardening per TINA_VISUAL_EDITING_GAP_ANALYSIS.md). Markers were placed as placeholders without the bridge. FACT.

## Fix options
- A. Pilot on homepage hero only: mount `<TinaIsland name="hero">` in index.astro, add metadata query behind existing Zod gate, convert Hero markers to `tinaField()`, fix hero.propsFromData coverage. (Recommended; see VISUAL_EDIT_WIRING_AUDIT.md pilot plan.)
- B. Wire all pages at once. Rejected: larger blast radius, About divergence unresolved.
- C. Leave dashboard-only editing. Rejected silently: owner explicitly expects visual editing.

## Decision
**A — one-page pilot (index hero), one concern per commit, after P0-2 save proof.** About page divergence must be resolved before its wiring (loaders import vs truth-gate source decision required).

## Risk / Validation
Risk: TinaIsland adds client JS to hero — must re-run check:perf (budget 60B CSS headroom noted; JS budget 48KB). Public visitors without edit mode must stay byte-identical (adapter serves static; island only hydrates in edit context). Validation: HITL click-to-edit on staging/preview + perf gate PASS + public HTML diff empty.
