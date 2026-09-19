---
description: Chrome/Playwright forensic debugging — console, network, iframe, CSP, postMessage, Tina bridge, /tina-island/*
agent: browser-forensics
---

Delegate to `browser-forensics` subagent. Target: $ARGUMENTS (URL or symptom; empty = `https://ukbanglatigers.co.uk/` + `/admin/`).

Tasks:
1. Snapshot page (accessibility tree) + console messages + network requests (via Playwright/Chrome DevTools MCP).
2. Capture: CSP headers (`frame-ancestors`), `adminOrigin` from live HTML, `data-tina-field` marker counts, frame/iframe tree, cookie/storage state.
3. For Tina admin: verify bridge `isFromAdmin` origin check, `postMessage` boundary, `/tina-island/*` fetch status.
4. Correlate symptom in $ARGUMENTS to exact console/network lines (include request indexes + status).
5. Return table: check | evidence | verdict; suggest minimal fix with `ponytail:` ceiling note if applicable.

Exhaust MCP capabilities before declaring blocked; never fabricate session.
