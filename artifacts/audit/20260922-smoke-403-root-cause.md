# 20260922 smoke-403 root cause (diagnosis only, observe-only)

Date (UTC): 2026-09-22. Run: 35463035934 (HEAD e544985). No app-code edits, no
edge changes, no secrets printed. 403s are observed-response only.

## OBSERVED_SYMPTOM

Post-deploy smoke (run 35463035934, 2026-09-19T19:08:29Z) reported
`SMOKE_STATUS = FAIL` with five 403 failures against the identity-verified
deployment (live BUILD_ID `e544985` matched expected `e544985`):

`{"SMOKE_STATUS":"FAIL","base":"https://ukbanglatigers.co.uk","failures":[{"rule":"homepage-status","detail":"GET / -> 403"},{"rule":"subroute-status","detail":"GET /about -> 403"},{"rule":"not-found-status","detail":"GET /definitely-nonexistent-route-ukbt-test -> 403"},{"rule":"island-status","detail":"POST /tina-island/hero -> 403"},{"rule":"admin-status","detail":"GET /admin/ -> 403"}],"warnings":[]}`

## AFFECTED_REQUESTS

- GET / → 403 (rule `homepage-status`)
- GET /about → 403 (rule `subroute-status`)
- GET /definitely-nonexistent-route-ukbt-test → 403 (rule `not-found-status`)
- POST /tina-island/hero → 403 (rule `island-status`; smoke content-type
  `application/x-tina-preview+json`)
- GET /admin/ → 403 (rule `admin-status`)

All five failed within the same second (19:08:29Z) from the GH runner
(ubuntu-24.04, westus hosted compute).

## KNOWN-GOOD_REQUEST

In the SAME failing run, seconds earlier:

- `2026-09-19T19:08:29.3260971Z ok - asset: GET /favicon.svg -> 200`
- `2026-09-19T19:08:29.3564143Z ok - headers: CSP + nosniff present on GET /`

And live today (2026-09-22T17:44Z, https://ukbanglatigers.co.uk):

- Browser-like GET / → 200 (`Server: cloudflare`, Ray `a3f31d90d80a4cbf-SIN`,
  `CF-Cache-Status: HIT`, `text/html`)
- Runner-like GET / (`GitHub-Actions` UA) → 200 (`Server: cloudflare`, Ray
  `a3f31dbaebf04cbf-SIN`, `CF-Cache-Status: HIT`, `text/html`, identical body prefix)
- POST /tina-island/hero (`{}` as `application/json`) → 404 `Not Found`
  (Ray `a3f31de7da474cbf-SIN`). Note: smoke uses
  `application/x-tina-preview+json`, so this 404 is not a like-for-like
  reproduction of the island-status rule.

Today's 200s are a time-bounded signal, not proof of fix.

## EDGE_EVIDENCE

EDGE_EVIDENCE=UNAVAILABLE. `$env:CLOUDFLARE_API_TOKEN` and
`$env:CLOUDFLARE_ZONE_ID` are both EMPTY on this runner, so the Security
Events API / dashboard cannot be reached with available tooling. No WAF, Bot
Management, firewall, ASN/UA, or rate-limit rule can be confirmed or excluded.
No rule invented; no whitelist/edge change made.

## WORKER_EVIDENCE

No Worker-side mechanism proven. No `cf-mitigated`/`cf-chl` challenge headers
were captured on 2026-09-19 (smoke records status only), and no Worker logs
were reachable from available tooling. The POST-hero 404-vs-403 difference
across content types keeps a Same-Origin/CSRF-style guard or route-matching
behavior as a candidate mechanism only — not a verdict.

## ROOT_CAUSE

UNKNOWN. The historical 403s are verified (correct BUILD_ID, verbatim log) but
no edge or Worker mechanism has been proven, and the failures do not reproduce
today from this vantage point (both UAs → 200; POST hero → 404).

## CONFIDENCE

Low for any specific mechanism; high that the 2026-09-19 403s genuinely
occurred and that they are not reproducing today (2026-09-22T17:44Z).

## MINIMAL_FIX

None taken (diagnosis only). Narrowest plausible next step, owner approval
required: re-run the UNMODIFIED smoke once against production with
response-header capture (`server`, `cf-ray`, `cf-cache-status`,
`cf-mitigated`/`cf-chl` if present); only if a 403 recurs, the zone owner
inspects Security Events for those Ray IDs. No WAF/Bot/ASN/UA change without
that evidence.

## SECURITY_IMPACT

No security posture changed by this task. No bypass, whitelist, or policy
relaxation proposed as action. Any future edge change must be owner-approved
and Ray-ID-scoped to avoid weakening Bot/WAF protection.

## ROLLBACK

No changes made; nothing to roll back.

## CLASSIFICATION

- HTTP_403=VERIFIED
- CAUSE=UNKNOWN
- Evidence: verbatim 2026-09-19T19:08:29Z smoke log, five 403s against
  identity-verified BUILD_ID `e544985` (run 35463035934).
- Contradictory evidence: same-run `GET /favicon.svg → 200` and CSP/nosniff
  present on `GET /`; 2026-09-22 both UAs → 200 HIT and POST hero → 404.
  A persistent UA/ASN block fits neither.
- Confidence: low (mechanism) / high (occurrence + current non-reproduction).
- Narrowest plausible remediation: header-capturing smoke re-run + owner
  Security-Events lookup keyed by Ray ID (see MINIMAL_FIX).
- Automatable? Partially (header capture yes; dashboard lookup needs owner
  credentials).
- Owner approval? Required before any edge/WAF/Bot change or production
  smoke re-run that could page or mutate state.
