#!/usr/bin/env node
// Motion gate — enforces MOTION-CONTRACT.md statically. Fails on:
// literal transition/animation durations or easing functions in
// component/page styles, `transition: all`, height animations,
// scroll listeners with DOM reads, per-element observers, missing
// reduced-motion view-transition kill, missing ClientRouter, missing
// reveal-controller arming. Output ends with:
//   MOTION_STATUS = PASS | FAIL
import { globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, 'apps/web/src');

const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

// 1. Shorthand transition/animation declarations must reference motion
// tokens. Longhands (`animation-delay` choreography offsets,
// `transition-timing-function` directional overrides) are intentionally
// out of scope: delays stage shared durations, they are not a second
// duration language. Multi-line shorthands are joined before testing.
const styleFiles = globSync('**/*.{astro,css}', { cwd: srcDir });
const ALLOWLIST = new Set([
  // base.css holds the reduced-motion kill (0.01ms literals) by design —
  // covered by rule 3 instead.
  'base.css',
]);
for (const f of styleFiles) {
  const body = readFileSync(join(srcDir, f), 'utf8');
  const blocks = body.split('<style>')[1] ?? (f.endsWith('.css') ? body : '');
  const lines = blocks.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let t = lines[i].trim();
    if (!t || t.startsWith('/*') || t.startsWith('*') || t.startsWith('//')) {
      continue;
    }
    // Join multi-line shorthand declarations.
    if (/^(transition|animation)\s*:/.test(t)) {
      while (!t.includes(';') && i + 1 < lines.length) {
        i += 1;
        t += ` ${lines[i].trim()}`;
      }
      if (/transition\s*:\s*all\b/.test(t)) {
        fail('transition-all', `${f}: ${t.slice(0, 80)}`);
      }
      if (/\b(?:height|max-height)\b/.test(t)) {
        fail('layout-animation', `${f}: ${t.slice(0, 80)}`);
      }
      if (!ALLOWLIST.has(f.split('/').pop() ?? '')) {
        if (/\b\d+(?:\.\d+)?m?s\b/.test(t) && !/var\(--ukbt-motion/.test(t)) {
          fail('literal-duration', `${f}: ${t.slice(0, 80)}`);
        }
        if (
          /\b(?:ease(?:-in-out|-in|-out)?|linear|cubic-bezier\()/.test(t) &&
          !/var\(--ukbt-motion/.test(t)
        ) {
          fail('literal-easing', `${f}: ${t.slice(0, 80)}`);
        }
      }
    }
  }
}

// 2. No scroll listeners, no per-component observers (one controller only).
for (const f of globSync('components/*.astro', { cwd: srcDir })) {
  const body = readFileSync(join(srcDir, f), 'utf8');
  if (/addEventListener\s*\(\s*['"]scroll['"]/.test(body)) {
    fail('scroll-listener', f);
  }
  if (/new\s+IntersectionObserver/.test(body)) {
    fail('component-observer', `${f}: observers live only in BaseLayout`);
  }
}

// 3. Reduced-motion view-transition kill present.
{
  const base = readFileSync(join(srcDir, 'styles/base.css'), 'utf8');
  if (!/::view-transition-(group|old|new)/.test(base)) {
    fail('vt-reduced-motion', 'base.css lacks the VT reduced-motion kill');
  }
  if (!/::view-transition-old\(root\)/.test(base)) {
    fail('vt-states', 'base.css lacks old/new view-transition states');
  }
}

// 4. ClientRouter wired in the layout.
{
  const layout = readFileSync(join(srcDir, 'layouts/BaseLayout.astro'), 'utf8');
  if (!/ClientRouter/.test(layout)) {
    fail('client-router', 'BaseLayout.astro does not render <ClientRouter />');
  }
  if (!/ukbt-motion-js/.test(layout)) {
    fail('reveal-controller', 'BaseLayout.astro lacks the motion controller');
  }
}

// 5. Reveal utility present and correctly gated (no-JS renders visible).
{
  const base = readFileSync(join(srcDir, 'styles/base.css'), 'utf8');
  if (!/html\.ukbt-motion-js \[data-motion='reveal'\]/.test(base)) {
    fail('reveal-gating', 'reveal initial states are not controller-gated');
  }
}

// 6. Sweet-spot reduced motion: entrances degrade to the opacity-only
// soft fade (never the full choreography), state changes stay instant.
{
  const base = readFileSync(join(srcDir, 'styles/base.css'), 'utf8');
  if (!/@keyframes ukbt-soft-fade/.test(base)) {
    fail('soft-fade-missing', 'no ukbt-soft-fade keyframes in base.css');
  }
  for (const sel of [
    '.ukbt-hero__headline',
    '.ukbt-page-banner__inner',
    "html.ukbt-motion-js [data-motion='reveal']",
  ]) {
    const idx = base.indexOf(sel, base.indexOf('ukbt-soft-fade'));
    if (idx === -1) {
      fail('soft-fade-coverage', `${sel} not in the soft-fade layer`);
    }
  }
}

const result = {
  MOTION_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
};
console.log(JSON.stringify(result, null, 2));
console.log(`MOTION_STATUS = ${result.MOTION_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
