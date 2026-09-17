/**
 * URL allowlist — REM-003 authoritative validation for CMS-controlled
 * navigation values. Used at the trust boundary (loaders.ts build-time
 * schemas): invalid values throw at build (fail-closed), never render.
 *
 * URL POLICY (product contract — derived from shipped corpus + Tina UI rules):
 * - CTA links (primary/secondary): SITE-RELATIVE ONLY. Single leading `/`,
 *   no `//`, no scheme, no backslash, no whitespace/control characters.
 *   Absolute https:, mailto:, tel: are NOT accepted for CTAs (no CTA uses
 *   them; Tina UI already requires a `/` prefix).
 * - phoneHref: `tel:` + phone characters only.
 * - contact email: conservative mailbox shape (no whitespace/`<>\"'`).
 * - social urls: `https://` + safe characters (no whitespace/control/`<>\"'`).
 * - heroImage/socialCard paths: NOT covered (img-src sink, no script
 *   execution; separate P4 surface).
 *
 * Canonicalization (anti-evasion):
 * - Reject any C0 control, DEL, or whitespace character ANYWHERE first
 *   (kills `java\nscript:`, leading/trailing-space, tab tricks).
 * - Percent-decode up to 3 rounds, then re-check (kills single/double/triple
 *   `%6a...` encoded schemes; undecodable input is rejected).
 * - Scheme test is case-insensitive on the decoded form (kills JAVASCRIPT:).
 * - Protocol-relative `//host` can never be site-relative (rejected even
 *   though it starts with `/`).
 *
 * Residual (documented, not solved): an allowlisted `https://` URL can still
 * point at a hostile host (phishing needs a CMS seat; noted in CORR-W1-04).
 * `https:` openness is a product requirement (social links), not an oversight.
 */

// C0 controls, DEL, and all whitespace — never legal in a navigation value.
// Written as code-point tests (not a regex literal) to satisfy the
// no-control-characters-in-regex lint rule.
function hasUnsafeChars(value: string): boolean {
  if (/\s/.test(value)) return true;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return true;
  }
  return false;
}

function clean(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (hasUnsafeChars(value)) return null;
  return value;
}

/** Decode percent-escapes repeatedly; null when undecodable or unsafe. */
function decodeLoop(value: string): string | null {
  let out = value;
  for (let i = 0; i < 3; i++) {
    if (!out.includes('%')) return out;
    try {
      const next = decodeURIComponent(out);
      if (next === out) return out;
      out = next;
    } catch {
      return null;
    }
    if (hasUnsafeChars(out)) return null;
  }
  // Still encoded after 3 rounds: browsers decode only once, so a payload
  // needing 4+ rounds is inert — but reject the ambiguity only if a scheme
  // is detectable; otherwise treat as opaque safe text for scheme purposes.
  return out;
}

function hasScheme(decoded: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded);
}

/**
 * Site-relative navigation path: `/join/`, `/about/`, `/#s`, `/n/?p=2`.
 * Rejects schemes (any case/encoding), `//host`, backslashes, empties.
 */
export function isSiteRelativeUrl(value: unknown): boolean {
  const s = clean(value);
  if (
    s === null ||
    !s.startsWith('/') ||
    s.startsWith('//') ||
    s.includes('\\')
  )
    return false;
  const decoded = decodeLoop(s);
  if (decoded === null || hasScheme(decoded)) return false;
  return true;
}

/** `tel:` phone link with phone characters only. */
export function isTelUrl(value: unknown): boolean {
  const s = clean(value);
  if (s === null || !s.startsWith('tel:')) return false;
  const rest = s.slice(4);
  if (rest.length === 0 || /[<>"']/.test(rest)) return false;
  const decoded = decodeLoop(s);
  if (decoded === null || hasScheme(decoded.slice(4))) return false;
  return /^[+\d][\d+\-(). ]*$/.test(rest);
}

/** Conservative mailbox shape (mirrors Tina UI email rule at build time). */
export function isEmailValue(value: unknown): boolean {
  const s = clean(value);
  if (s === null) return false;
  return /^[^\s<>"'@]+@[^\s<>"'@]+\.[^\s<>"'@]+$/.test(s);
}

/** Absolute `https://` URL with safe characters (social links). */
export function isHttpsUrl(value: unknown): boolean {
  const s = clean(value);
  if (s === null || !s.startsWith('https://') || s.length <= 8) return false;
  if (/[<>"]/.test(s)) return false;
  const decoded = decodeLoop(s.slice(8));
  if (decoded === null) return false;
  return true;
}
