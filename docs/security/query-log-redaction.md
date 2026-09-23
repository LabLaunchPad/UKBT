# Query-string log redaction

Changed 2026-09-11 (P0/P1 hardening, audit F-06):
`wrangler.jsonc` → `observability.redact_query_string: false → true`.

## What is redacted

With redaction on, Cloudflare strips the query string from URLs before
writing Workers invocation logs. A request to
`/players/?token=abc&next=/admin` is logged as `/players/` — path,
method, status, and timings remain; the `?...` portion does not.

## Why

Invocation logs persist (`persist: true`, full sampling) in Cloudflare's
pipeline. Query strings are the classic accidental-secret carrier
(password-reset tokens, share links, UTM/session IDs, mistyped PII).
Redaction makes an entire leak class structurally impossible rather
than relying on nobody ever putting something sensitive in a URL.

## Functionality checked (all OBSERVED, 2026-09-11)

- `apps/web/src`: zero uses of `location.search` / `URLSearchParams`
  (repo-wide search, no matches)
- No forms anywhere (asserted by `pages.spec.ts` contact test)
- No site search, no query-bearing redirects, no query-dependent
  analytics (Sentry DSN is env-only server config; no browser query use)
- View Transitions / ClientRouter prefetch use plain path URLs
- Sitemap, robots, canonical/OG URLs: all bare paths

Conclusion: nothing legitimate reads a query string at runtime, so
redaction removes no debugging signal the site actually produces.

## What remains observable

Paths, response statuses, cache states, timings, ray IDs, user agents,
and client IPs per Cloudflare's default log schema. If a future feature
(e.g. search, filtered views via `?q=`) needs query visibility, revisit
this flag — preferably by logging an allowlisted parameter explicitly
rather than disabling redaction wholesale.
