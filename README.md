<div align="center">

<img src="https://raw.githubusercontent.com/LabLaunchPad/UKBT/main/apps/web/public/brand/crest-512.png" alt="UK Bangla Tigers crest" width="140" />

# UK Bangla Tigers

**United by Passion. Driven by Cricket.**

The official website of **UK Bangla Tigers Cricket Club (CIC, est. 2020)** — an evidence-gated Astro monorepo deployed to Cloudflare.

[![CI](https://github.com/LabLaunchPad/UKBT/actions/workflows/ci.yml/badge.svg)](https://github.com/LabLaunchPad/UKBT/actions/workflows/ci.yml)
[![Live site](https://img.shields.io/badge/site-ukbanglatigers.co.uk-16a34a?style=flat)](https://ukbanglatigers.co.uk/)
[![Astro](https://img.shields.io/badge/astro-7.x-BC52EE?style=flat&logo=astro&logoColor=white)](apps/web)
[![Cloudflare](https://img.shields.io/badge/cloudflare-workers-F6821F?style=flat&logo=cloudflare&logoColor=white)](wrangler.jsonc)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=flat&logo=pnpm&logoColor=white)](pnpm-workspace.yaml)
[![Biome](https://img.shields.io/badge/biome-lint%20%2B%20format-60a5fa?style=flat)](biome.json)

[🌐 Live site](https://ukbanglatigers.co.uk/) · [📋 Roadmap](docs/12-roadmap-and-open-items.md) · [🤝 Contributing](CONTRIBUTING.md) · [🔒 Security](SECURITY.md)

</div>

---

<img src="https://raw.githubusercontent.com/LabLaunchPad/UKBT/main/apps/web/public/social-card.jpg" alt="UK Bangla Tigers — team social card" width="100%" />

## About the club

| | |
|---|---|
| 🏏 **Club** | UK Bangla Tigers Cricket Club (Community Interest Company) |
| 📅 **Founded** | 2020 |
| 👥 **Squad** | 58 players + 4 team officials on /players (50 photos, 8 monograms); 20 players + 4 officials on /franchises/uppsala-tigers |
| 🌍 **Reach** | 15+ countries · internationals on the roster |
| 🏆 **Stage** | 7+ international tournaments — Safari International T20 Cup, Nordic Smash T20, Asian Challengers Trophy |
| 🤝 **Family** | Sister franchise **Uppsala Tigers** (Sweden) |

> Every organisation-specific claim on the site — players, stats, history, leadership — is backed by a sourced evidence record. `UNKNOWN` is a complete and acceptable answer; a plausible guess is not.

## The site

16 routes — Home, About, Club Captain, Players Profile, Tournaments, Franchises (plus the Uppsala Tigers franchise page), News (plus per-article slugs), Membership, Join, Services, Contact, FAQ, Offline, 404 — plus the Tina island re-render endpoint — plus a TinaCMS editorial layer for headlines, CTAs and FAQs.

<div align="center">
<img src="https://raw.githubusercontent.com/LabLaunchPad/UKBT/main/apps/web/public/media/team-huddle.webp" alt="Squad team huddle" width="32%" />
<img src="https://raw.githubusercontent.com/LabLaunchPad/UKBT/main/apps/web/public/media/gallery-04.webp" alt="Match action" width="32%" />
<img src="https://raw.githubusercontent.com/LabLaunchPad/UKBT/main/apps/web/public/media/founder-trophy.webp" alt="Founder with trophy" width="32%" />
</div>

## Why this repo stands out

- **Truth gate before pixels** — `@ukbt/truth` (Zod schemas + provenance types) validates every content module; the build fails if facts don't check out.
- **18-gate release pipeline** — `pnpm deploy:verify` runs scaffold self-test → control plane → deps → lint → tokens → typecheck → unit → build → deploy-mapping → release-path → content-trust → failure-injection → links → SEO → UI → motion → security → perf. A subset passing is never a release pass.
- **Motion with a contract** — `contracts/MOTION-CONTRACT.md` enforces tokens-first animation, a two-tier reduced-motion model (instant states, soft-fade entrances), and zero third-party JS animation runtimes.
- **Budgets as gates** — HTML/CSS/JS transfer weights, contrast, focus coverage, internal-link integrity and security headers are all machine-checked in CI.
- **Adversarial memory** — past failures live in `artifacts/adaptive-learning/` (error catalog → prevention checklist → recurrence protocol), so mistakes get fixed once.

## Tech stack

| Layer | Choice |
|---|---|
| Site | Astro 7 (static output) + Astro ClientRouter view transitions |
| Deploy | Cloudflare Workers + static assets (`wrangler.jsonc`) |
| Monorepo | pnpm workspaces — `apps/web`, `packages/truth` |
| Truth & tokens | Zod + Style Dictionary design tokens |
| CMS | TinaCMS (editorial layer only — never bypasses the truth gate) |
| Quality | Biome, TypeScript strict, Vitest, Playwright |
| CI | GitHub Actions, 18 required checks, branch protection on `main` |

## Project structure

```
apps/web/               # Astro site — one .astro per route, typed content modules
packages/truth/         # @ukbt/truth — schemas, provenance, truth gate, design tokens
contracts/              # frozen, machine-checkable agreements (motion, routes, SEO, …)
knowledge/              # compact decision substrate (read before project-level decisions)
artifacts/              # evidence records, verification receipts, adaptive learning
scripts/                # the 18 gate checks behind pnpm deploy:verify
docs/                   # pipeline, roadmap, runbooks (Tina, visual truth, …)
.opencode/              # 9 read-only motion-advisor agents + vendored animation skills
```

## Quickstart

```bash
pnpm install          # frozen lockfile
pnpm dev              # Astro dev server (apps/web)
pnpm build            # tokens → Astro build → sitemap
pnpm deploy:verify    # the full 18-gate release check
```

| Command | Purpose |
|---|---|
| `pnpm lint` / `pnpm typecheck` | Biome + `tsc --noEmit` |
| `pnpm test:unit` / `pnpm test:e2e` | Vitest (truth gate) / Playwright (visual, a11y, responsive) |
| `pnpm check:motion` | tokens, reduced motion, reveal gating (`MOTION_STATUS = PASS`) |
| `pnpm check:seo` / `check:perf` / `check:ui` | built-output crawl, transfer budgets, headings/focus/images |

## Project status — single source of truth

Status is never hand-copied into this file (three documents once drifted that way). Read the live answer where it actually lives:

| Question | Where the current answer lives |
|---|---|
| Stage, gates, what's next | `docs/12-roadmap-and-open-items.md` |
| What's verified vs `UNKNOWN` | `knowledge/01-VERIFIED-FACTS.yaml` |
| Did the last build/tests/a11y actually pass | `artifacts/receipts/` (`RELEASE.md`, `HOMEPAGE.md`) |
| Independent review findings | `artifacts/review/` |
| Blocked on the client, not engineering | `artifacts/content/CLIENT-ASK-LIST.md` |
| How to work here | `CLAUDE.md` → `AGENTS.md` → `knowledge/00-KNOWLEDGE-CONTRACT.md` |

## Contributing & security

- Workflow, branches and PR rules: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Report vulnerabilities: [`SECURITY.md`](SECURITY.md) — please don't open public issues for them.
- Every PR to `main` needs all 18 CI checks green; `main` is protected.

## Notices

Vendored third-party animation knowledge is attributed in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md). Site photography and crest are club assets.
