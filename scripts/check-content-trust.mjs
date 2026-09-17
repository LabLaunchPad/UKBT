#!/usr/bin/env node
// Content-trust boundary gate (REM-004) — enforces D-001/D-003/D-005/D-006:
// (1) every Tina collection field is classified in the central policy
//     (apps/web/src/lib/content-trust.ts); unclassified or dynamically-named
//     fields FAIL;
// (2) JSON-LD emitters and structuredData props never consume Tina-sourced
//     values (truth-sourced only), tracked through import aliases and one
//     level of const indirection, across pages/components/layouts/lib;
//     island and on-demand Tina routes must never emit structured data;
// (3) every truth-gate exemptFields literal (any Set spelling) is registered
//     in the central EXEMPT_POLICY; page-local silent exemptions FAIL.
// Output ends with:
//   CONTENT_TRUST_STATUS = PASS | FAIL
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.UKBT_CHECK_ROOT
  ? process.env.UKBT_CHECK_ROOT
  : dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const read = (p) => readFileSync(join(root, p), 'utf8');
const has = (p) => existsSync(join(root, p));

function netBraces(s) {
  let n = 0;
  for (const ch of s) {
    if (ch === '{' || ch === '[') n += 1;
    else if (ch === '}' || ch === ']') n -= 1;
  }
  return n;
}

// --- Rule 1: classification completeness ------------------------------------
// Dotted field paths from tina/config.ts. Accepts single/double/backtick
// `name:` spellings (a dynamic template name fails closed: it cannot be
// classified statically). Column-aware depth so single-line objects resolve.
function configFieldPaths(src) {
  const paths = [];
  const stack = [];
  let depth = 0;
  const nameRe = /name\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
  for (const line of src.split('\n')) {
    for (const m of line.matchAll(nameRe)) {
      const name = m[1] ?? m[2] ?? m[3];
      if (m[3]?.includes('${')) {
        fail(
          'dynamic-field-name',
          'tina/config.ts: dynamic field name cannot be classified',
        );
        continue;
      }
      const before = line.slice(0, m.index);
      const d = depth + netBraces(before);
      while (stack.length > 0 && stack[stack.length - 1].depth >= d) {
        stack.pop();
      }
      stack.push({ name, depth: d });
      if (stack.length > 1) paths.push(stack.map((s) => s.name).join('.'));
    }
    depth += netBraces(line);
  }
  return paths;
}

if (!has('tina/config.ts') || !has('apps/web/src/lib/content-trust.ts')) {
  fail('trust-inputs-missing', 'tina/config.ts or content-trust.ts absent');
} else {
  const policy = read('apps/web/src/lib/content-trust.ts');
  const classified = new Set(
    [...policy.matchAll(/'([a-zA-Z0-9_.]+)':\s*(?:p\(|\{)/g)].map((m) => m[1]),
  );
  for (const p of configFieldPaths(read('tina/config.ts'))) {
    if (!classified.has(p)) {
      fail('unclassified-tina-field', `${p} has no trust classification`);
    }
  }
}

// --- Rule 2: structured-data guard (taint-tracked) ----------------------------
// Tainted origins: Tina loaders and Tina JSON documents (importing Tina JSON
// directly bypasses even loaders). Code-owned *-data.ts is gated truth and
// is NOT tainted. Aliases (`as`) and one const-indirection level are followed.
function identifiersIn(src) {
  return new Set([...src.matchAll(/[A-Za-z_$][\w$]*/g)].map((m) => m[0]));
}

function taintedInFile(src) {
  const tainted = new Set();
  const isTinaOrigin = (from) =>
    from.includes('tina/loaders') ||
    /content\/(faq|homepage|site)\//.test(from);
  for (const m of src.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g,
  )) {
    if (!isTinaOrigin(m[2])) continue;
    for (const part of m[1].split(',')) {
      const alias = part
        .split(/\s+as\s+/)
        .pop()
        .trim();
      if (/^[A-Za-z_$][\w$]*$/.test(alias)) tainted.add(alias);
    }
  }
  // Default and namespace imports from Tina origins (`import siteData from
  // '.../siteSettings.json'`, `import * as siteData ...`) bind the whole
  // module object — equally tainted.
  for (const m of src.matchAll(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+)['"]/g,
  )) {
    if (isTinaOrigin(m[2])) tainted.add(m[1]);
  }
  for (const m of src.matchAll(
    /import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+)['"]/g,
  )) {
    if (isTinaOrigin(m[2])) tainted.add(m[1]);
  }
  // Bare tina-prefixed identifiers are Tina-sourced by naming convention
  // (covers fixtures and any path that dodges the import list); import
  // aliases above additionally cover renamed bindings like tina_homepage.
  for (const m of src.matchAll(/\btina[A-Z][\w$]*/g)) {
    tainted.add(m[0]);
  }
  // One-level const propagation to a fixpoint (covers `const d = tinaX` and
  // `const g = homepageGraph({... tina ...})` intermediates).
  for (let round = 0; round < 3; round++) {
    let grown = false;
    for (const m of src.matchAll(
      /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g,
    )) {
      if (tainted.has(m[1])) continue;
      for (const tok of identifiersIn(m[2])) {
        if (tainted.has(tok)) {
          tainted.add(m[1]);
          grown = true;
          break;
        }
      }
    }
    if (!grown) break;
  }
  return tainted;
}

// Emitter names: *Graph( heuristic plus anything imported from lib/seo.
function emitterNames(src) {
  const names = new Set(
    [...src.matchAll(/([A-Za-z_$][\w$]*)Graph\s*\(/g)].map(
      (m) => `${m[1]}Graph`,
    ),
  );
  for (const m of src.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]*lib\/seo[^'"]*)['"]/g,
  )) {
    for (const part of m[1].split(',')) {
      const alias = part
        .split(/\s+as\s+/)
        .pop()
        .trim();
      if (/^[A-Za-z_$][\w$]*$/.test(alias)) names.add(alias);
    }
  }
  return names;
}

function balancedFrom(src, openIndex) {
  // openIndex points at '(' or '{'. Returns the balanced span or ''.
  const pairs = { '(': ')', '{': '}' };
  const want = pairs[src[openIndex]];
  if (!want) return '';
  let depth = 0;
  for (let k = openIndex; k < src.length; k++) {
    if (src[k] === src[openIndex]) depth += 1;
    else if (src[k] === want) {
      depth -= 1;
      if (depth === 0) return src.slice(openIndex, k + 1);
    }
  }
  return '';
}

function scanStructuredFile(rel, src) {
  const tainted = taintedInFile(src);
  if (tainted.size === 0) return;
  for (const name of emitterNames(src)) {
    let i = src.indexOf(`${name}(`);
    while (i !== -1) {
      const call = balancedFrom(src, src.indexOf('(', i));
      for (const tok of identifiersIn(call)) {
        if (tainted.has(tok)) {
          fail('structured-tina-input', `${rel}: Tina value reaches ${name}()`);
          break;
        }
      }
      i = src.indexOf(`${name}(`, i + 1);
    }
  }
  for (const m of src.matchAll(/structuredData=\{/g)) {
    const span = balancedFrom(src, m.index + 'structuredData='.length);
    for (const tok of identifiersIn(span)) {
      if (tainted.has(tok)) {
        fail(
          'structured-tina-prop',
          `${rel}: Tina value reaches structuredData prop`,
        );
        break;
      }
    }
  }
}

const scanDirs = [
  'apps/web/src/pages',
  'apps/web/src/components',
  'apps/web/src/layouts',
  'apps/web/src/lib',
];
for (const dir of scanDirs) {
  if (!has(dir)) continue;
  for (const f of globSync('**/*.{astro,ts}', { cwd: join(root, dir) })) {
    if (f.endsWith('content-trust.ts')) continue;
    scanStructuredFile(`${dir}/${f}`, read(`${dir}/${f}`));
  }
}

// Island and on-demand Tina routes must never emit structured data at all:
// they serve presentation props over request-time paths the build cannot see.
for (const f of globSync('**/islands.ts', {
  cwd: join(root, 'apps/web/src'),
})) {
  const src = read(`apps/web/src/${f}`);
  if (/lib\/seo|ld\+json|Graph\(|structuredData/.test(src)) {
    fail(
      'island-structured-emission',
      `apps/web/src/${f}: islands must not emit structured data`,
    );
  }
}
for (const f of globSync('**/*.ts', {
  cwd: join(root, 'apps/web/src/pages/tina-island'),
})) {
  const src = read(`apps/web/src/pages/tina-island/${f}`);
  if (/lib\/seo|ld\+json|Graph\(|structuredData/.test(src)) {
    fail(
      'island-structured-emission',
      `tina-island/${f}: island route must not emit structured data`,
    );
  }
}

// --- Rule 3: exemption centralization ------------------------------------------
// Any `new Set([...])` spelling (with or without type arguments) counts;
// page-local literals must be registered in EXEMPT_POLICY.
if (has('apps/web/src/lib/content-trust.ts') && has('apps/web/src/content')) {
  const policy = read('apps/web/src/lib/content-trust.ts');
  const allowed = new Set(
    [...policy.matchAll(/'(nav\.[a-z]+|cta\.[a-z]+\.[a-z]+)'/g)].map(
      (m) => m[1],
    ),
  );
  for (const f of globSync('*.ts', {
    cwd: join(root, 'apps/web/src/content'),
  })) {
    const src = read(`apps/web/src/content/${f}`);
    const m = src.match(
      /exemptFields\s*=\s*new Set(?:<[^;]*?>)?\s*\(\s*\[([\s\S]*?)\]\)/,
    );
    if (!m) continue;
    for (const lit of m[1].matchAll(/['"]([^'"]+)['"]/g)) {
      if (!allowed.has(lit[1])) {
        fail(
          'unregistered-exemption',
          `${f}: '${lit[1]}' exempt without central policy entry`,
        );
      }
    }
  }
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ CONTENT_TRUST_STATUS: status, failures }));
console.log(`CONTENT_TRUST_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
