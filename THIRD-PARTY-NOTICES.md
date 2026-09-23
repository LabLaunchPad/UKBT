# Third-Party Notices

## web-animation-skills (iart-ai)

- Source: `https://github.com/iart-ai/web-animation-skills`
- Vendored commit: `b6dba3eb759726845a44163ff0bad70dd9e7fbb6` (2026-09-15)
- Location in this repo: `.opencode/skills/` (9 skills: `60fps-animation`, `accessible-animation`, `svg-animation`, `micro-interaction`, `gsap-web`, `page-transition-animation`, `glassmorphism`, `lottie-animation`, `ascii-animation`)
- License: MIT — Copyright (c) 2026 iart.ai
- The upstream `SKILL.md` bodies are kept intact; each carries a `## UKBT overlay (binding)` section that overrides upstream guidance where it conflicts with `contracts/MOTION-CONTRACT.md`.
- No upstream runtime code or npm dependency is used — agent guidance (Markdown) only. `scripts/img-to-ascii.mjs` vendored under `.opencode/skills/ascii-animation/scripts/` is agent-side tooling and must never ship to site output.

```
MIT License

Copyright (c) 2026 iart.ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Self-hosted fonts (apps/web/public/fonts/)

The site ships three self-hosted font files. Both families are licensed
under the SIL Open Font License 1.1 (OFL-1.1), which permits embedding
and self-hosting with resale restrictions only on the fonts themselves.
License texts are not bundled with the binary files; the canonical texts
live at the URLs below. Note (open item U-27): the OFL classification was
inherited from the brand-asset intake and has not been independently
re-verified against the received files (see
`artifacts/adelux/ADELUX-SOURCE-FINGERPRINT.md`).

| File | Family | License |
|---|---|---|
| `lato-400.woff2` | Lato Regular — Copyright (c) 2010-2014 by tyPoland Lukasz Dziedzic, with Reserved Font Name "Lato" | SIL OFL 1.1 — https://openfontlicense.org |
| `lato-700.woff2` | Lato Bold — same copyright holder and Reserved Font Name | SIL OFL 1.1 — https://openfontlicense.org |
| `montserrat-variable.woff2` | Montserrat Variable — Copyright 2011-2017 The Montserrat Project Authors (https://github.com/JulietaUla/Montserrat), OFL-1.1 via google/fonts | SIL OFL 1.1 — https://openfontlicense.org |

OFL grant summary: use, study, modify, embed (including in web pages via
@font-face) and redistribute are permitted; selling the fonts *themselves*
is not, and Reserved Font Names apply to derivative fonts only.
