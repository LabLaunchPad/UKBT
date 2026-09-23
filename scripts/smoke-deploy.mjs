#!/usr/bin/env node
// Post-deploy smoke gate — deterministic HTTP assertions against a deployed
// base URL (preview or production). Added 2026-09-15 after the production
// 404 shipped behind 15 green CI gates: nothing checked the DEPLOYED site.
// Usage: node scripts/smoke-deploy.mjs https://ukbanglatigers.co.uk
// Output ends with:
//   SMOKE_STATUS = PASS | FAIL
const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!base) {
  console.log('usage: node scripts/smoke-deploy.mjs <base-url>');
  process.exit(2);
}

const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const pass = (rule, detail) => console.log(`ok - ${rule}: ${detail}`);

async function get(path, init) {
  const url = base + path;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body = await res.text();
    return { status: res.status, headers: res.headers, body };
  } finally {
    clearTimeout(timer);
  }
}

// 1. Homepage: 200 + real UKBT document (not a platform error page).
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

// 2. Known valid sub-route.
{
  const r = await get('/about');
  if (r.status !== 200) fail('subroute-status', `GET /about -> ${r.status}`);
  else pass('subroute', 'GET /about -> 200');
}

// 3. Known static asset.
{
  const r = await get('/favicon.svg');
  if (r.status !== 200) {
    fail('asset-status', `GET /favicon.svg -> ${r.status}`);
  } else pass('asset', 'GET /favicon.svg -> 200');
}

// 4. Unknown route: 404 AND the UKBT custom 404 document.
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

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ SMOKE_STATUS: status, base, failures }));
console.log(`SMOKE_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
