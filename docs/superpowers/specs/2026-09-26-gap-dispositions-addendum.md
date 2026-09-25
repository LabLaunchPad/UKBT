# Gap dispositions 2026-09-26 (addendum to `2026-09-26-ui-design-system-audit-design.md`)

## G-1 shadow depth — NO-GO
Shadow depth gap closed — no consumer needs lg/xl/inner; adding them would be speculative. (7 consumers tabulated; deepest sit on `md`; Task 1 report: `.superpowers/sdd/token-gap-coverage/task-1-report.md`, review clean.)

## G-2 named keyframes — NO-GO
Keyframe token would be abstraction without repetition. (9 distinct keyframes, all MOTION-CONTRACT-compliant; page-in/banner-in identical bodies stay separate per motion-matrix rows; Task 2 report + review clean.)

## G-3 component sizing — COVERED
All Token-dependencies cites in card/link/breadcrumb contracts resolve to approved tokens; layout/geometry cross-check clean. (Task 3 report + review clean. Note: brief Step 4 "48 passed" was a brief-side error — scoped file holds 13 tests, 13/13 pass.)

## Deferred (not gaps)
- C2: `link.contract.md:14` States row cites `--ukbt-color-focus-ring` with no approved definition (local property with fallback). Color-scope observation for future triage, not a sizing gap.
- F-1/F-2 upstream draft text recorded in `.superpowers/sdd/token-gap-coverage/task-4-report.md` (git-ignored workspace, not shipped). Filing upstream is an owner side effect.

## Follow-ups
None. No `adapted/` draft: no verdict was GO. Any future token adoption is its own lifecycle task.
