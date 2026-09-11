# Security Policy — UK Bangla Tigers website

## Scope

This policy covers the production website at
`https://ukbanglatigers.co.uk` and the source that builds it in this
repository. It does not cover third-party platforms themselves
(GitHub, Cloudflare, Sentry) — report issues in those to their own
security teams.

## What is in scope

- The deployed static site: information disclosure, security-header
  regressions, malicious content injection vectors.
- The build and deploy pipeline in this repository (workflows, scripts,
  dependency supply chain).

## What is out of scope (no attack surface exists)

This is a fully static site: there is no backend, no database, no
authentication, no user accounts, no forms, no file upload, and no
server-side code. Reports in the classes SQL injection, XSS via stored
input, CSRF, SSRF, IDOR, or auth bypass cannot apply — please do not
file them. Scanner output alone, without a demonstrated impact on this
site, is not treated as a vulnerability.

## How to report

Email the club's public contact address (the same address published on
the website's Contact page):

**info@ukbanglatigers.co.uk**

- Subject line: `[SECURITY] brief description`
- Include: affected URL or file, steps to reproduce, and the impact you
  believe it has. Proof-of-concept traffic must stay non-destructive:
  no data modification, no denial of service, no access beyond what is
  publicly reachable.

## What happens next

- Acknowledgement within **5 working days**.
- Triage outcome (valid / not applicable / duplicate) within
  **15 working days** of acknowledgement.
- Fixes ship with the normal release process; externally visible
  regressions are fixed first.

## Disclosure guidance

Please do not publicly disclose a suspected vulnerability before the
triage window above has elapsed. Once fixed (or confirmed not
applicable), public write-ups are welcome — credit on request.

## Supported versions

Only the currently deployed production build is supported. Historical
tags, stale branches, and preview deployments are not supported
targets, though reports about them are still read.
