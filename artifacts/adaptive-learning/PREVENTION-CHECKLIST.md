# Prevention Checklist — run BEFORE acting

For any agent (human or AI) working in this repo. Each gate maps to a
catalog entry (AL-xx). Skip a gate only by writing down why.

## Before editing code or content

- [ ] P1. Have I READ the exact file region I'm changing (AL-003)?
- [ ] P2. For UI wiring: have I read BOTH the data shape AND the
  receiving component's Props (AL-002)?
- [ ] P3. For sizing/spacing: did I MEASURE (rects, totals vs
  container) rather than eyeball (AL-001, AL-017)?
- [ ] P4. For cross-component CSS: does my selector cross an Astro
  scope boundary? If yes, `:global()` the foreign half (AL-008).
- [ ] P5. For infinite animations: is the resting base state declared
  (AL-007)? Does a test forbid loops — and if so, is there a contract
  amendment (AL-020)?
- [ ] P6. For controls in a ClientRouter app: delegation + fresh
  queries + window guard + after-swap reset (AL-009)? Icon-only
  targets exact 24×24, no negative-margin encroachment (AL-010)?

## Before stating facts or renaming

- [ ] P7. One-word entity differences are confirmed, never inferred
  (AL-014). New values cite client/evidence sources, never memory.
- [ ] P8. Supplied binaries VIEWED before staging (AL-013); tests
  grepped for old paths on any asset/copy change (AL-011).

## Before claiming builds/deploys/tests

- [ ] P9. Have I read the workflow `needs`/`if`/triggers, all deploy
  paths included (AL-015)? Is the claim verified against live bytes
  (AL-016), not one dashboard view?
- [ ] P10. `deploy:verify` is the release gate; browser e2e is a
  separate suite with its own backlog (roadmap §2.14). Never conflate
  the two verdicts.

## Environment (this box: win32, PowerShell 5.1)

- [ ] P11. One command per call; `cmd /c` for cmd idioms; no
  `&&`/`;`/`head` in PowerShell; `workdir` not `cd` (AL-004); CLIs
  via `cmd /c` (AL-005).
- [ ] P12. Browser specs run with `CI=true`; dev server stopped first
  (port conflict); stale-CSS suspicion → check `dist/` first, then
  restart dev + hard refresh (AL-006, AL-012).
- [ ] P13. Captures: networkidle → slow scroll → per-section settle
  (AL-018); dev-toolbar chrome is not a bug (AL-019).
