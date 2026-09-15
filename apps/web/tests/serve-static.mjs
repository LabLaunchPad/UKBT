#!/usr/bin/env node
// Minimal static file server for Playwright e2e tests.
// Serves apps/web/dist/client/ (Cloudflare adapter output) on a plain
// HTTP server so service workers and other browser APIs work normally.
// No external dependencies — Node.js stdlib only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..', 'dist', 'client');
const PORT = Number(process.env.PORT || 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

async function serve(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = join(ROOT, pathname);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    // Astro-style fallback: /foo → /foo/index.html, then try /foo.html
    for (const fallback of [
      join(ROOT, pathname, 'index.html'),
      join(ROOT, pathname + '.html'),
    ]) {
      try {
        const data = await readFile(fallback);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } catch { /* continue */ }
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1>');
  }
}

const server = createServer(serve);
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Static server listening on http://127.0.0.1:${PORT} (serving ${ROOT})`);
});
