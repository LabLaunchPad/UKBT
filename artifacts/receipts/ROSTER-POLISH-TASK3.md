# Roster Polish — Task 3 receipt (contrast + focus ring)

- Date (UTC): 2026-09-28 23:46
- Branch/SHA: feat/premium-roster-polish @ 153d446
- Suites: `axe.spec.ts` + `ui-focus.spec.ts` → exit code 0, 4 passed (2 axe incl. deliberate-violation sanity check, 2 ui-focus)
- Keyboard walkthrough: method = Playwright chromium driving served production build (`pnpm --filter @ukbt/web build` PASS incl. CONTENT_TRUST PASS + CSP PASS; Tina 401s for about/faq are pre-existing local-credential noise; `dist/client` served via `node apps/web/tests/serve-static.mjs` on :4321), viewport 1280x800, verdict PASS — first filter pill ("All") reached after 15 Tabs with ring `solid 2px rgb(0, 0, 0) offset 2px`; Space on "Wicket-keepers" toggles `aria-pressed` true (All → false) with count updating to "5 of 58 Players"; first "Verified note" `<details>` opens on Enter, closes on second Enter, opens on Space; 60-Tab sweep hit 31 distinct focus targets with working Shift+Tab (no trap); Uppsala page pill ring identical (`solid 2px rgb(0, 0, 0)`)
- Ratios: gold-on-navy = 7.21, white-on-navy = 16.84, muted-on-white = 10.30 (method: WCAG 2.x relative-luminance formula `(Llighter + 0.05) / (Ldarker + 0.05)` computed in a throwaway node script for `#CCA44F`/`#001E3A`, `#FFFFFF`/`#001E3A`, `#3F4048`/`#FFFFFF`; spot-checked gold-on-navy by hand ≈ 7.21)
- Verdict: GREEN (all ≥4.5:1, ring visible)
