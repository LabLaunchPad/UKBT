#!/usr/bin/env node
// Post-deploy smoke gate — deterministic HTTP assertions against a deployed
// base URL (preview or production). Added 2026-09-15 after the production
// 404 shipped behind 15 green CI gates: nothing checked the DEPLOYED site.
// REM-002: runs automatically post-merge (ci.yml `smoke-verify` job) with
// --expect-sha + bounded deploy-wait, so a release cannot verify green
// against stale bytes. Manual use unchanged (identity check skipped with
// a warning when no expected SHA is supplied).
// Usage: node scripts/smoke-deploy.mjs <base-url> [--expect-sha <sha>] [--wait-secs <n>]
// Output ends with:
//   SMOKE_STATUS = PASS | FAIL
const args = process.argv.slice(2);
const base = (args[0] || '').replace(/\/+$/, '');
if (!base || base.startsWith('--')) {
  console.log(
    'usage: node scripts/smoke-deploy.mjs <base-url> [--expect-sha <sha>] [--wait-secs <n>]',
  );
  process.exit(2);
}
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
// PROVES: target binding (smoke observes the deployment CI just produced).
// DOES NOT PROVE: cryptographic provenance (7-char BUILD_ID prefix match).
const expectedSha = flag('--expect-sha') || process.env.EXPECTED_SHA || '';
const waitSecs = Math.max(0, Number(flag('--wait-secs') || '600') || 0);
// Test hook for the failure-injection suite (scripts/test-smoke-failure-
// injection.mjs sets SMOKE_POLL_MS=200); production default polls every 20s.
const pollMs = Math.max(
  50,
  Number(process.env.SMOKE_POLL_MS || '20000') || 20000,
);

const failures = [];
const warnings = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const pass = (rule, detail) => console.log(`ok - ${rule}: ${detail}`);
const warn = (rule, detail) => {
  warnings.push({ rule, detail });
  console.log(`warn - ${rule}: ${detail}`);
};

async function get(path, init) {
  const url = base + path;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body = await res.text();
    return { status: res.status, headers: res.headers, body };
  } catch (err) {
    // Network/timeout errors become a failed assertion, never a crash or
    // a silent pass: status 0 matches no success condition below.
    return { status: 0, headers: new Headers(), body: '', error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

function readBuildId(swBody) {
  const m = swBody.match(/BUILD_ID\s*=\s*'([^']+)'/);
  return m ? m[1] : '';
}

// 0. Deploy-wait + identity (REM-002). PROVES: the observed deployment is
// the build CI produced (BUILD_ID prefix-matches the merge SHA) before any
// health assertion runs. DOES NOT PROVE: provenance (short-string marker).
// Skipped with a warning for manual runs without --expect-sha.
if (expectedSha) {
  const short = expectedSha.slice(0, 7);
  const deadline = Date.now() + waitSecs * 1000;
  let observed = '';
  for (;;) {
    const r = await get('/sw.js');
    observed = r.status === 200 ? readBuildId(r.body) : '';
    if (observed && (expectedSha.startsWith(observed) || observed === short))
      break;
    if (Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  if (!observed) {
    fail(
      'deploy-wait',
      `BUILD_ID unreadable after ${waitSecs}s (expected ${short})`,
    );
  } else if (!(expectedSha.startsWith(observed) || observed === short)) {
    fail(
      'deployment-identity',
      `live BUILD_ID '${observed}' does not match expected '${short}' after ${waitSecs}s`,
    );
  } else {
    pass(
      'deployment-identity',
      `live BUILD_ID '${observed}' matches expected '${short}'`,
    );
  }
  if (failures.length > 0) {
    // Identity mismatch: the observed deployment is not ours — running the
    // health assertions against it would verify the wrong release.
    const statusEarly = 'FAIL';
    console.log(
      JSON.stringify({ SMOKE_STATUS: statusEarly, base, failures, warnings }),
    );
    console.log(`SMOKE_STATUS = ${statusEarly}`);
    process.exit(1);
  }
} else {
  warn(
    'identity-skipped',
    'no --expect-sha/EXPECTED_SHA: asserting health only, not identity',
  );
}

// 1. Homepage: 200 + real UKBT document (not a platform error page).
// PROVES: edge serves the app shell. DOES NOT PROVE: content correctness.
{
  const r = await get('/');
  if (r.status !== 200) {
    fail('homepage-status', `GET / -> ${r.status}`);
  } else if (!r.body.includes('UK Bangla Tigers')) {
    fail('homepage-content', 'GET / 200 but missing UKBT marker');
  } else {
    pass('homepage', `200, ${r.body.length} bytes, UKBT marker present`);
  }
}

// 2. Known valid sub-route. PROVES: routing works beyond /. DOES NOT PROVE:
// full route matrix (representative sample only).
{
  const r = await get('/about');
  if (r.status !== 200) fail('subroute-status', `GET /about -> ${r.status}`);
  else pass('subroute', 'GET /about -> 200');
}

// 3. Known static asset. PROVES: static-asset serving works.
{
  const r = await get('/favicon.svg');
  if (r.status !== 200) {
    fail('asset-status', `GET /favicon.svg -> ${r.status}`);
  } else pass('asset', 'GET /favicon.svg -> 200');
}

// 4. Unknown route: 404 AND the UKBT custom 404 document.
// PROVES: not_found_handling serves the custom 404 (INC-001 class detector).
// DOES NOT PROVE: wrangler value itself (observes behavior, not config).
{
  const r = await get('/definitely-nonexistent-route-ukbt-test');
  if (r.status !== 404) {
    fail(
      'not-found-status',
      `GET /definitely-nonexistent-route-ukbt-test -> ${r.status}`,
    );
  } else if (!r.body.includes('bowled out')) {
    fail('not-found-content', '404 without UKBT custom-404 marker');
  } else {
    pass('not-found', '404 + custom UKBT 404 document');
  }
}

// 5. Security headers actually deployed (not just present in dist/).
// PROVES: served headers match policy on /. DOES NOT PROVE: headers on
// Worker-served dynamic routes (static-assets convention only).
{
  const r = await get('/');
  for (const h of ['content-security-policy', 'x-content-type-options']) {
    if (!r.headers.get(h)) fail('header-missing', `${h} absent on GET /`);
  }
  if (!failures.some((f) => f.rule === 'header-missing')) {
    pass('headers', 'CSP + nosniff present on GET /');
  }
}

// 6. Worker runtime route: Tina island POST with the bridge content type.
// PROVES: the on-demand Worker route is alive. DOES NOT PROVE: auth model
// (separate finding); performs no mutation (renders static island data).
{
  const r = await get('/tina-island/hero', {
    method: 'POST',
    headers: { 'content-type': 'application/x-tina-preview+json' },
  });
  if (r.status !== 200) {
    fail('island-status', `POST /tina-island/hero -> ${r.status}`);
  } else if (!r.body.includes('data-tina-island')) {
    fail('island-content', '200 but missing island marker');
  } else {
    pass('island', 'POST /tina-island/hero -> 200 island HTML');
  }
}

// 7. Tina admin document ships (generated by `tinacms build`).
// PROVES: the admin app deploys. DOES NOT PROVE: login/auth (owner-tested;
// requires TinaCloud seats). Accepts the login shell, not full function.
{
  const r = await get('/admin/');
  if (r.status !== 200) {
    fail('admin-status', `GET /admin/ -> ${r.status}`);
  } else if (!r.body.includes('id="root"')) {
    fail('admin-content', 'GET /admin/ 200 but missing admin app shell');
  } else {
    pass('admin', `GET /admin/ -> 200 admin shell (${r.body.length} bytes)`);
  }
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ SMOKE_STATUS: status, base, failures, warnings }));
console.log(`SMOKE_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
