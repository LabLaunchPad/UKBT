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
