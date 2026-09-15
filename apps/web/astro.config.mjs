import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';
import tina from '@tinacms/astro/integration';
import cloudflare from '@astrojs/cloudflare';

const integrations = [spotlightjs(), tina()];
if (process.env.SENTRY_DSN) {
  integrations.unshift(sentry({ dsn: process.env.SENTRY_DSN }));
}

export default defineConfig({
  output: 'static',
  // Canonical production domain, supplied by the owner 2026-09-06.
  site: 'https://ukbanglatigers.co.uk',

  // Pinned to the literal IPv4 loopback, not the default `localhost`.
  // Real CI failure (PR #1, check_run 98063976034): `astro preview`'s
  // default host binds to whatever `localhost` resolves to for Node's
  // getaddrinfo on that machine — IPv6 `::1` on GitHub Actions'
  // ubuntu-24.04 runners, IPv4 `127.0.0.1` in this sandbox. Playwright's
  // webServer.url in playwright.config.ts polls `http://127.0.0.1:4321`
  // explicitly, so on a host where `localhost` resolves to `::1` first,
  // the server was healthy but never observed as ready — a 120s hang,
  // not a build failure. Pinning both server and dev to the same literal
  // address removes the ambiguity everywhere, not just in CI.
  server: { host: '127.0.0.1' },
  adapter: cloudflare(),
  integrations,
});
