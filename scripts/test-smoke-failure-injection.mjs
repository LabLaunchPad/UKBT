#!/usr/bin/env node
import { spawn } from 'node:child_process';
// Smoke-gate failure injection (REM-002) — proves scripts/smoke-deploy.mjs
// fails closed on each defect class and passes on a healthy target, using an
// isolated local fixture server (never production). Follows the existing
// test-*-failure-injection.mjs pattern: synthetic fixtures, real gate code.
// NOTE: the fixture server and the smoke child run concurrently via async
// spawn (NOT spawnSync, which would block the event loop and starve the
// server of the connection the child is waiting on).
// Output ends with:
//   SMOKE_INJECTION_STATUS = PASS | FAIL
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const smoke = join(root, 'scripts/smoke-deploy.mjs');
const GOOD_SHA = 'abc1234def5678';
const results = [];

// Fixture server: implements every smoke endpoint; `mode` injects one fault.
function serve(mode, swBuildId, flipAfter = 0) {
  let swHits = 0;
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://x');
    const csp =
      mode === 'missing-csp'
        ? {}
        : {
            'content-security-policy': "default-src 'self'",
            'x-content-type-options': 'nosniff',
          };
    if (url.pathname === '/sw.js') {
      swHits += 1;
      const id = swHits > flipAfter ? swBuildId : 'stale000';
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end(`const BUILD_ID = '${id}';`);
      return;
    }
    if (url.pathname === '/' && mode === 'wrong-status') {
      res.writeHead(500, csp);
      res.end('boom');
      return;
    }
    if (
      url.pathname === '/definitely-nonexistent-route-ukbt-test' &&
      mode === 'broken-404'
    ) {
      res.writeHead(200, csp);
      res.end('<html><body>platform default, no marker</body></html>');
      return;
    }
    if (url.pathname === '/tina-island/hero' && req.method === 'POST') {
      res.writeHead(200, csp);
      res.end('<div data-tina-island="hero">x</div>');
      return;
    }
    if (url.pathname === '/favicon.svg') {
      res.writeHead(200, { 'content-type': 'image/svg+xml', ...csp });
      res.end('<svg></svg>');
      return;
    }
    if (url.pathname === '/definitely-nonexistent-route-ukbt-test') {
      res.writeHead(404, csp);
      res.end('<html><body>bowled out</body></html>');
      return;
    }
    if (url.pathname === '/admin/' && mode !== 'broken-admin') {
      res.writeHead(200, csp);
      res.end('<html><body><div id="root"></div></body></html>');
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html', ...csp });
    res.end('<html><body>UK Bangla Tigers</body></html>');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function runSmoke(url, sha, waitSecs) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [smoke, url, '--expect-sha', sha, '--wait-secs', String(waitSecs)],
      { env: { ...process.env, SMOKE_POLL_MS: '200' } },
    );
    let out = '';
    child.stdout.on('data', (d) => {
      out += d;
    });
    child.stderr.on('data', (d) => {
      out += d;
    });
    const killer = setTimeout(() => {
      child.kill();
      resolve({ code: -1, out: `${out}TIMEOUT` });
    }, 150000);
    child.on('close', (code) => {
      clearTimeout(killer);
      resolve({ code, out });
    });
  });
}

async function runCase(
  name,
  { mode, sha, waitSecs, flipAfter, expectExit, expectRule },
) {
  const server = await serve(mode, GOOD_SHA, flipAfter);
  const port = server.address().port;
  const { code, out } = await runSmoke(
    `http://127.0.0.1:${port}`,
    sha,
    waitSecs,
  );
  server.close();
  const okExit = code === expectExit;
  const okRule = expectRule ? out.includes(expectRule) : true;
  const pass = okExit && okRule;
  results.push({ name, pass, exit: code });
  console.log(`${pass ? 'ok' : 'FAIL'} - ${name}: exit=${code}`);
}

await runCase('healthy-target-passes', {
  mode: 'ok',
  sha: GOOD_SHA,
  waitSecs: 0,
  expectExit: 0,
});
await runCase('homepage-500-fails', {
  mode: 'wrong-status',
  sha: GOOD_SHA,
  waitSecs: 0,
  expectExit: 1,
  expectRule: 'homepage-status',
});
await runCase('missing-csp-fails', {
  mode: 'missing-csp',
  sha: GOOD_SHA,
  waitSecs: 0,
  expectExit: 1,
  expectRule: 'header-missing',
});
await runCase('broken-404-fails', {
  mode: 'broken-404',
  sha: GOOD_SHA,
  waitSecs: 0,
  expectExit: 1,
  expectRule: 'not-found',
});
await runCase('wrong-marker-fails', {
  mode: 'ok',
  sha: 'ffffffffffffffff',
  waitSecs: 0,
  expectExit: 1,
  expectRule: 'deployment-identity',
});
await runCase('stale-then-fresh-waits-and-passes', {
  mode: 'ok',
  sha: GOOD_SHA,
  waitSecs: 60,
  flipAfter: 2,
  expectExit: 0,
});
await runCase('broken-admin-fails', {
  mode: 'broken-admin',
  sha: GOOD_SHA,
  waitSecs: 0,
  expectExit: 1,
  expectRule: 'admin-content',
});

const failed = results.filter((r) => !r.pass);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    SMOKE_INJECTION_STATUS: status,
    failed: failed.map((r) => r.name),
  }),
);
console.log(`SMOKE_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
