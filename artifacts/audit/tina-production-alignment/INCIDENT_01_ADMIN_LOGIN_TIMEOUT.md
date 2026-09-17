# INCIDENT_01 — /admin first-login "Authentication failed: Login attempt timed out", retry succeeds
Date: 2026-09-18 | Reporter: owner (production https://ukbanglatigers.co.uk/admin/) | Status: OPEN, non-blocking

## Problem
First login attempt at /admin/ times out ("Authentication failed: Login attempt timed out. Click here to try again."). Clicking retry loads the normal TinaCloud dashboard. Sidebar collections work; visual editing absent (see INCIDENT_02).

## Evidence
- Owner report 2026-09-18 (T0): timeout first attempt, success on retry, every time ("always when login").
- Production serves merged main b6a0185; main CI green incl. post-deploy smoke (run 35266702340). Admin bundle builds and serves — not a deploy breakage.
- Research: LOGIN_TIMEOUT_AND_VISUAL_EDIT_RESEARCH.md Q1 — official cause is a blocked/slow domain in the auth redirect chain (Cognito/API Gateway/GitHub) with a documented ~20s limit (SUPPORTED, tina.io troubleshooting + network-requirements). Retry-success pattern itself is undocumented.
- Ruled out: `?origin=`/Site-URL mismatch gives "Invalid Site URL", not timeout (REFUTED). PUBLIC_TINA_ADMIN_ORIGIN is a bridge postMessage allowlist, not a login fix — setting it won't help (SUPPORTED via @tinacms/astro README).
- CSP: _headers:9 connect-src omits Cognito/GitHub/S3/PostHog hosts — but a CSP block would fail consistently, not intermittently (noted, not causal).

## Root cause
UNKNOWN. Hypotheses only (all UNCLEAR, no source): cold Worker serving /admin on first hit; transient TinaCloud auth-chain latency exceeding the 20s client limit; third-party cookie/session warmup. Retry succeeding points at transient/latency, not configuration.

## Fix options
- A. Observe only: retry works, dashboard functional; revisit if it worsens. Cost: zero. Risk: masks a real auth-chain issue.
- B. Instrument: record timestamps + browser network log of the failing attempt (which domain in the chain stalls) at next login; then target the fix. Cost: one login session. Risk: none.
- C. Pre-warm: curl /admin/ before login (warms Worker isolate). Cost: trivial. May do nothing if cause is TinaCloud-side.

## Decision
**B then A**: capture one failing attempt's network timing (which request exceeds 20s) before changing anything. No config changes (PUBLIC_TINA_ADMIN_ORIGIN, CSP, _headers) — research shows none address this symptom.

## Risk / Validation
Risk of action: none (observe-only). Validation: next login attempt with devtools network log; record stalled host + duration in this file.
