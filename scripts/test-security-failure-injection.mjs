#!/usr/bin/env node
// Security failure-injection suite — proves scripts/check-security.mjs
// fails on each known-bad header/leak topology, including the rules added
// 2026-09-18 (no 'unsafe-inline' in script-src, inline-script hash
// coverage, X-Frame-Options conflict with frame-ancestors). Minimal
// fixture trees under the OS temp dir, gate run with UKBT_CHECK_ROOT.
// A case passes only when the verdict matches.
// Output ends with:
//   SECURITY_INJECTION_STATUS = PASS | FAIL
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const gate = join(here, 'check-security.mjs');
const results = [];
const ok = (name, detail) => {
  results.push({ name, ok: true });
  console.log(`ok - ${name}: ${detail}`);
};
const bad = (name, detail) => {
  results.push({ name, ok: false, detail });
  console.log(`FAIL - ${name}: ${detail}`);
};

const INLINE = 'try{document.documentElement.classList.add("x")}catch{}';
const INLINE_HASH = `'sha256-${createHash('sha256').update(INLINE).digest('base64')}'`;

const PAGE = (extra = '') =>
  `<html><head><title>T</title>${extra}</head><body></body></html>`;

const HEADERS = (cspScriptSrc, extra = '') =>
  `/*\n  Strict-Transport-Security: max-age=31536000\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Resource-Policy: same-origin\n  Content-Security-Policy: default-src 'self'; script-src ${cspScriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://assets.tinajs.io https://*.tinajs.io; font-src 'self' data:; connect-src 'self' https://*.ingest.sentry.io https://*.tina.io https://app.tina.io https://*.tinajs.io https://s3.us-east-1.amazonaws.com https://us.i.posthog.com https://us-assets.i.posthog.com; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self' https://*.tina.io https://app.tina.io https://*.tinajs.io; upgrade-insecure-requests\n${extra}`;

// Good fixture: hashed inline script, no XFO, no unsafe-inline.
const GOOD_HEADERS = HEADERS(`'self' ${INLINE_HASH}`);

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-sec-'));
  const client = join(dir, 'apps/web/dist/client');
  const write = (rel, content) => {
    const full = join(client, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  write('_headers', files._headers ?? GOOD_HEADERS);
  if (files['index.html'] !== undefined)
    write('index.html', files['index.html']);
  else write('index.html', PAGE(`<script>${INLINE}</script>`));
  for (const [rel, content] of Object.entries(files)) {
    if (rel === '_headers' || rel === 'index.html') continue;
    write(rel, content);
  }
  return dir;
}

function runGate(dir) {
  try {
    const out = execFileSync('node', [gate], {
      env: { ...process.env, UKBT_CHECK_ROOT: dir },
      encoding: 'utf8',
    });
    return { exit: 0, out };
  } catch (error) {
    return { exit: error.status ?? 1, out: String(error.stdout ?? '') };
  }
}

const cases = [
  {
    name: 'good-fixture-passes',
    files: {},
    expectPass: true,
  },
  {
    // Audit 2026-09-18: CSP shipped script-src 'unsafe-inline' and the
    // gate only banned unsafe-eval — weakening the policy passed silently.
    name: 'unsafe-inline-in-script-src',
    files: { _headers: HEADERS(`'self' 'unsafe-inline' ${INLINE_HASH}`) },
    expectPass: false,
    expectRule: 'csp-unsafe',
  },
  {
    // A build that skips stamp-csp.mjs leaves inline scripts uncovered.
    name: 'inline-script-hash-missing',
    files: { _headers: HEADERS(`'self'`) },
    expectPass: false,
    expectRule: 'csp-inline-script-unhashed',
  },
  {
    // X-Frame-Options overrides frame-ancestors and breaks the Tina admin
    // same-origin edit iframe (audit 2026-09-18).
    name: 'xfo-conflicts-with-frame-ancestors',
    files: {
      _headers: GOOD_HEADERS.replace(
        '  Content-Security-Policy:',
        '  X-Frame-Options: DENY\n  Content-Security-Policy:',
      ),
    },
    expectPass: false,
    expectRule: 'framing-policy',
  },
  {
    name: 'missing-csp-header',
    files: {
      _headers: GOOD_HEADERS.replace(
        /^ {2}Content-Security-Policy:[^\n]*\n/m,
        '',
      ),
    },
    expectPass: false,
    expectRule: 'header-missing',
  },
  {
    name: 'unsafe-eval-in-csp',
    files: {
      _headers: GOOD_HEADERS.replace(
        "script-src 'self'",
        "script-src 'self' 'unsafe-eval'",
      ),
    },
    expectPass: false,
    expectRule: 'csp-unsafe',
  },
  {
    name: 'sourcemap-in-dist',
    files: { '_astro/chunk.abc123.js.map': '{"sources":[]}' },
    expectPass: false,
    expectRule: 'sourcemap-leak',
  },
  {
    name: 'env-file-in-dist',
    files: { '.env.production': 'TINA_TOKEN=x' },
    expectPass: false,
    expectRule: 'sensitive-file',
  },
  {
    name: 'http-subresource',
    files: {
      'index.html': PAGE('<script src="http://cdn.example.com/x.js"></script>'),
    },
    expectPass: false,
    expectRule: 'http-subresource',
  },
  {
    // Review 2026-09-18: a hash left in the CSP after its script was
    // removed silently widens the inline-script allowlist over time.
    name: 'stale-extra-hash-in-csp',
    files: {
      _headers: HEADERS(
        `'self' ${INLINE_HASH} 'sha256-QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI='`,
      ),
      'index.html': PAGE(`<script>${INLINE}</script>`),
    },
    expectPass: false,
    expectRule: 'csp-stale-hash',
  },
  {
    name: 'headers-file-absent',
    files: { _headers: undefined },
    expectPass: false,
    expectRule: 'headers-missing',
  },
];

for (const c of cases) {
  const files = { ...c.files };
  const skipHeaders = c.name === 'headers-file-absent';
  const dir = fixture(files);
  if (skipHeaders) rmSync(join(dir, 'apps/web/dist/client/_headers'));
  try {
    const r = runGate(dir);
    if (c.expectPass) {
      if (r.exit === 0) ok(c.name, 'gate PASS on good fixture');
      else
        bad(
          c.name,
          `expected PASS, got exit=${r.exit}\n${r.out.slice(0, 400)}`,
        );
    } else if (r.exit !== 0 && r.out.includes(c.expectRule)) {
      ok(c.name, `gate FAIL with ${c.expectRule}`);
    } else {
      bad(c.name, `expected FAIL/${c.expectRule}, exit=${r.exit}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const failed = results.filter((r) => !r.ok);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    SECURITY_INJECTION_STATUS: status,
    passed: results.length - failed.length,
    total: results.length,
    failed: failed.map((f) => f.name),
  }),
);
console.log(`SECURITY_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
