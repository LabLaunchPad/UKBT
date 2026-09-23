# Blocker-Closure Certificate — P0-12/13 (anti-drift + hygiene + cert)

- Date (UTC): 2026-09-23 (cert task run; item runs 2026-09-22/23 per reports)
- BASE: `e544985322376dead374106f3b9c5f1b58e43614`
- HEAD: `e544985322376dead374106f3b9c5f1b58e43614` (verified `git rev-parse HEAD` at task open; hygiene deletions touch only ignored/untracked files — HEAD unchanged)
- Branch: `main`. Commits by this program: **NONE** (held working tree; Wave-2 owns integration — program rule per ledger)
- Skill: `systematic-debugging` invoked first (Phases 1–4 observed; no prod fix without root cause — none was warranted, see §1)
- TA triple read first: `20260923-tina-admin-certification.md` (§S: `TINACMS_ADMIN_CLOSED_WITH_EXTERNAL_BLOCKERS`), `20260923-tina-admin-closure.md`, `20260923-tina-admin-issue-register.md`; plus `progress.md`, `plan.md`, all `task-B1/B2/P03-P11` reports

## 1. Anti-drift second pass — bypass verdict: NO SECOND BYPASS FOUND

Assumed one indirect bypass remains; searched instead of assuming (method = proof of search):

- **Button href passers enumerated (11 sites, 8 files):** `Hero.astro:97,99` (overlay-derived — FIXED B2), `AboutCTA.astro:26,34` (source `homepage.social[0].url` + literal `/contact/`), `Header.astro:97` (source `homepage.primaryCta` code-owned; no island renders Header), `SectionHeader.astro:67` (all callers literal: `index.astro:127` + `community.astro:42` `/tournaments/`, `NewsTeaser.astro:30` `/news/`), `CaptainSpotlight.astro:53`, `club-captain.astro:143`, `404.astro:21`, `offline.astro:38,39` (all literals).
- **All island overlay→URL flows (`islands.ts`):** `primaryCtaLink`/`secondaryCtaLink` gated via `isSiteRelativeUrl` (B2); `heroImage` raw into `Hero.astro` but component-sanitized (`sanitizeImageSrc` + `/media/team-huddle.webp` fallback, R-IMG-01 green); `social` is code-pinned (`homepage.social`, line 81 — NOT overlay-derived); `crumbs` hardcoded; `aboutStory`/`faq`/`whyChooseUs`/leadership carry no href sinks (FAQ strings escaped, objects via URL-sanitized `TinaMarkdown`; `WhyChooseUs.astro` has zero href sinks).
- **AboutCTA-like external hrefs:** `SocialLinks.astro:70 href={s.url}` + `AboutCTA.astro:28` take `homepage.social` — on the island path code-pinned (unreachable from overlay), on the static path build-gated (`loaders.ts:78-84` `isHttpsUrl`: requires `https://` prefix after whitespace/control rejection — `javascript:` cannot pass). Legit `external` https links (B2's reason for rejecting a Button-boundary gate) confirmed real: AboutCTA follow-links. **Not a same-class defect.**
- **P0-4 second pass:** new rules additive only; exit-code contract preserved (`failures.length===0` still drives PASS/exit); `workers-deploy` stays opt-in (no mandatory flip — evidence forbids); smoke stays detector-not-gate; `check-control-plane` PASS with new output fields (P10 §1h). No error→success conversion, no gate weakening, no docs/code contradiction (report §1 table matches `check-release-path.mjs` diff verbatim).
- **P0-7 second pass:** test-only file; mirror caveat explicitly recorded (report §Residual-1); no prod drift possible from it. Test-only guarantee risk is documented, not hidden.
- **P0-8 escapes (rows 6–9) re-checked:** deliberate two-step obfuscation shapes only; `grep` confirms none in-tree (no dynamic `import(`, no re-export barrels under `apps/web/src`); triggers T1–T4 stand. Not a shipped bypass.
- **Stale artifacts:** `dist/` is stale build output (KNOWN-RED, unstamped `_headers`, admin hash drift) — correctly gitignored, correctly failing its gates; not deployed per TA §O. No stale artifact presented as current.
- **Unrelated mutations:** none by this program — tracked diff beyond BASE is prior held state (P0-2 publish wiring, Wave-1 layered spec) + this program's B2/P0-4/P0-7 files; P10 `git diff --stat` confirms scope.

## 2. Hygiene — classification + actions

| Item | Class | Disposition |
|---|---|---|
| 15 tracked modified (`AGENTS.md`, `ClubIntro.astro`, 7× `*-data.ts`, `islands.ts`, `mobile-ux.spec.ts`, `tina-protocol.spec.ts`, `gate/index.ts`, 2× release-path scripts) | TRACKED_CHANGE (held program state) | Kept; Wave-2 owns integration |
| `packages/truth/src/gate/publish.ts` + `publish.test.ts`, `about-story.test.ts`, `tina-layered.spec.ts`, `docs/adr-001-*` | HELD_PROGRAM_CHANGE (untracked, Wave-2 scope) | Kept; not adopted/moved by this task |
| `artifacts/audit/2026092*`, `artifacts/*plan*.md`, `docs/superpowers/plans/*`, `.superpowers/sdd/*` (incl. this program's reports) | AUDIT_EVIDENCE | Kept (deletion forbidden) |
| `.agents/skills/*`, `skills-lock.json` | TOOLING (environment-installed) | Kept; not repo scope, not mine to remove |
| `apps/web/public/admin/`, `apps/web/dist/`, `**/src/styles/generated/` | GENERATED (gitignored build output) | Kept; two files removed below (regenerable) |
| `t9-tmp/` (dev.log, home.html, scratch configs/probes) | ACCIDENTAL (Temp-derived T9 scratch) | **REMOVED** (verified: no secrets via token/secret/clientId/`TINA_TOKEN` grep incl. home.html + dev.log; zero repo references via `t9-tmp` grep over scripts/tests/truth) |
| `apps/web/public/admin/.gitignore` + `apps/web/dist/client/admin/.gitignore` | GENERATED (tinacms output; content verified `index.html` + `assets/`, no secrets) | **REMOVED both** (smaller option: zero repo diff, zero behavior change, no RED needed; file lives inside a gitignored dir) |

**Hygiene verification (fresh):** `node scripts/check-security.mjs` → FAIL with exactly the 3 build-dependent rules (`csp-unstamped`, 2× `csp-inline-script-unhashed` — stale unstamped `dist`, KNOWN-RED); the 4th P10 failure `sensitive-file admin\.gitignore` is **GONE** with no gate code touched. P10 §4b concern CLOSED.
**Regeneration trigger:** if a future `tinacms build` recreates `public/admin/.gitignore`, take the exempt-route then (narrow `admin/.gitignore` carve-out in `check-security.mjs` with a RED injection case proving `.env*` and non-admin `.gitignore` still fail) — not now, per ladder.

## 3. Per-item status table

| Item | Status | Code diff | Blocked-by |
|---|---|---|---|
| B1 V2 spec | COMPLETE (research-only, review clean after 1 round) | none | — |
| B2 V2 gate R-CTA-01 | DONE_WITH_CONCERNS (12/13 e2e; fix green) | `islands.ts` + `tina-protocol.spec.ts` | R-GATE-02 ENV-BLOCKED (TinaCloud 401, creds) |
| P0-3 registry | COMPLETE — (b) DEFERRED, D1/D2/D3 triggers | none | U-22 owner |
| P0-4 release control | COMPLETE — 2 rules + authority warning, 13/13 injection | 2 scripts | owner deploy-path decision |
| P0-5 403 re-probe | COMPLETE — UNREPRODUCED / CAUSE=UNKNOWN | none | none (owner lookup only if recurs) |
| P0-6 TinaCloud | COMPLETE — verify-only, flags kept | none | T8-B owner |
| P0-7 About pin | COMPLETE — 13-test contract, no prod change | `about-story.test.ts` only | creds Save round-trip |
| P0-8 content-trust | COMPLETE — (b) DEFERRED, T1–T4 triggers | none | trigger-gated AST project |
| P0-9 CI audit | COMPLETE — NO P0, 7 gaps trigger-recorded | none | per-trigger owners |
| P0-10 matrix | COMPLETE — 27 PASS / 2 FAIL-expected / 1 env-blocked | none | build-red + creds |
| P0-11 injection | COMPLETE — 69/69, 2/2 negative proof | none | — |
| P0-12/13 this cert | COMPLETE — bypass search + hygiene + cert | cert file only | externals below |

## 4. Root causes closed (code-actionable)

1. Overlay `javascript:`-href echo (hero CTA) → `isSiteRelativeUrl` gate + defaults (B2; green replay P10).
2. Release-path silent-absence topologies (smoke skipping with deploy; deploy without main-ref) → 2 gate rules + `DEPLOY_AUTHORITY` declaration (P0-4; 13/13).
3. Layered geometry baseline regression (`.ukbt-hero__bg` overlap) → Wave-1 marker-scope fix, 4/4 + negative proof intact (P10 §3).
4. `admin/.gitignore` tripping `sensitive-file` → source + stale-dist removal, verified gone (§2).

## 5. Externals — exact owner actions (NOT simulated)

- **T8-A Save artifact:** TinaCloud project `ukbt-uk-bangla-tigers` (`fe5da197…`), branch `main`: edit `faq.items[0].answer` before `"Visit the Join page or contact us at info@ukbanglatigers.co.uk. Trials and training details are shared via our social channels."` → after `"<same> — edit <UTC>"`; record commit SHA + `faq.json` diff + deployment `BUILD_ID` + live `/faq` suffix + `/admin/` hash rotation → revert via History.
- **T8-B Reindex+unskip:** dashboard Content → Reindex → `Complete`; then with `PUBLIC_TINA_CLIENT_ID`+`TINA_TOKEN`+`TINA_BRANCH=main`: `pnpm exec tinacms build --skip-search-index` (no `--skip-cloud-checks`) exit 0 + `git diff tina/tina-lock.json` stable (FAQ `answer: String`); only then remove `--skip-cloud-checks` (`package.json:18` + `ci.yml`) in one commit.
- **T8-C Drift reconcile:** owner push/Save so Builds publishes repo `LQnB6IK5` over live `DswcyTjG`; report `BUILD_ID`/live SHA.
- **T8-D Post-login sweep:** T5 overlay stacking + Save/Cancel + T6 labels/contrast/modal — record only, TinaCloud seat required.
- **R-GATE-02 creds run:** re-run `tina-protocol.spec.ts` in any TinaCloud-creds env (dev or CI) — expects 200 (B2 §1 cause: fork-pr fallback 401).
- **Deploy-path decision (P0-4 §4):** set `WORKERS_DEPLOY_VIA_CI=true`, provision `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, disconnect Workers Builds git integration; verify next push-to-main `workers-deploy` green + smoke observes CI deploy.
- **U-22/U-23:** registry owner + truth-lifecycle migration (tracked at `artifacts/*20-iteration*`).
- **403 recurrence:** zone-owner Security Events lookup by Ray ID only (P0-5: no action while UNREPRODUCED).

## 6. Negative proof / regression / governance

- **Negative proof 2/2:** R-CTA-01 RED (B2 §1: 3× `jsHrefs` returned evil hrefs) → GREEN replay P10 §2; P0-4 rules RED (P0-4 §3: 11/13 injection) → GREEN replay P11 §1 row 7 (13/13). No re-breaking, per instruction.
- **Regression:** P10 8/8 static (lint 87 files, typecheck, unit 48/48, parity, content-trust, release-path gate+13/13, control-plane) + B2 12/1 + layered 4/4 + live 3/3; P11 69/69 injection; post-hygiene `check-security` (§2). Prod `astro build` KNOWN-RED by design (T6 fail-closed) — not run, not claimed.
- **Governance:** no commit/push; no weakening (deploy opt-in kept, smoke detector role kept, exit codes preserved); no secrets printed or stored; no simulated Save/auth; file scope respected (only this cert file added, as tasked).

## 7. Deferred (trigger-gated, not dropped)

P0-3 D1/D2/D3 · P0-8 T1–T4 (RED seeds documented) · P0-9 T-PH/T-VIS/T-GIT/T-UI/T-MO/T-LI/T-NODE · `admin/.gitignore` regeneration → exempt-route (§2) · V2 follow-up NEW task (island preview bypass by design; no truth-sensitive fields on islands until closed) · U-22/U-23 migration.

## 8. AL-NEXT lessons (this program)

- AL-NEXT-01: PowerShell has no `head`/`&&` — use `Select-Object -First` + `; if ($?) { }` (AGENTS.md shell rule; bitten twice this task).
- AL-NEXT-02: `Select-String -Path` needs files, not dirs — use the repo `grep` tool for directory search.
- AL-NEXT-03: stock `pnpm test:e2e` unusable where `playwright.config.ts` points at `/opt/pw-browsers/chromium` — scratch config + delete-after (P10 §7 precedent).
- AL-NEXT-04: `BUILD_ID` prefix match = target binding, NOT provenance (P0-4 §1/§4.3) — never claim more.
- AL-NEXT-05: generated dotfiles inside gitignored build dirs (`public/admin/.gitignore`) leak into `dist/` and trip `sensitive-file` — remove at source, exempt only on regeneration.

## 9. Final state

**`BLOCKERS_CLOSED_WITH_EXTERNAL`** — every code-actionable blocker in B1/B2/P03–P11 is closed with fresh measured evidence and anti-drift re-verified; what remains is exclusively HUMAN_REQUIRED externals (§5: T8-A/B/C/D, R-GATE-02 creds run, deploy-path decision, U-22/U-23). `NOT_CLOSED` is not justified: no open code defect, no failing gate attributable to repo code.

## 10. Wave-2 integration addendum (2026-09-23, post-cert, transcription only — no re-investigation)

- Direct push to `origin/main` REJECTED by ruleset GH013 (18/18 checks required); no bypass attempted. Integration rerouted as PR #96 (OPEN, MERGEABLE, mergeState BLOCKED), branch `chore/wave2-blocker-closure`, head `9a3f302`, base `main`, commits `648b21e` + `7d81ec6` + `9a3f302` (boundaries per Wave-2 review).
- CI run `35804157789` on PR #96: 9 PASS (Lint, Typecheck, Unit/integration, Control-plane, Dependency-allowlist, Failure-injection, Scaffold, Install, Secret-scan); Build FAIL BY DESIGN with verbatim `Truth gate failed for 'captain.name': T6: status=pending_review is not publishable — production requires approved/published with a named approver` (exit 1); all downstream jobs (deploy-mapping, links, SEO, UI, motion, perf, Playwright, security, smoke, workers-deploy) honest-skips off failed Build; Workers Builds branch entry fail. Live production untouched (PRs don't deploy).
- Local `main` reset to `origin/main` `e544985`; work on `chore/wave2-blocker-closure`; working tree clean tracked.
- Externals: NO owner artifacts arrived (no Save evidence, no reindex proof, no dashboard/deploy-path/U-22-23 evidence) — all remain BLOCKED_EXTERNAL.
- Per-item final states: code-actionable items (§3–§4) CLOSED; items needing owner proof (T8-A/B/C/D, R-GATE-02 creds run, deploy-path decision, U-22/U-23) BLOCKED_EXTERNAL; trigger-gated follow-ups (§7) DEFERRED.
- Verdict KEPT: **`BLOCKERS_CLOSED_WITH_EXTERNAL`**. No code changes by this cert update. No commit. No push.
