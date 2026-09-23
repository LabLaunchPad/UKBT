import {
  isEmailValue,
  isHttpsUrl,
  isSiteRelativeUrl,
  isTelUrl,
} from '../allowed-urls';

function hasUnsafeChars(value: string): boolean {
  if (/\s/.test(value)) return true;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return true;
  }
  return false;
}

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
  return out;
}

export function validateUrl(
  value: string,
  type: 'site-relative' | 'https' | 'tel' | 'email',
): boolean {
  switch (type) {
    case 'site-relative':
      return isSiteRelativeUrl(value);
    case 'https':
      return isHttpsUrl(value);
    case 'tel':
      return isTelUrl(value);
    case 'email':
      return isEmailValue(value);
    default:
      return false;
  }
}

export function sanitizeImageSrc(src: string): string | null {
  if (typeof src !== 'string' || src.length === 0) return null;
  if (hasUnsafeChars(src)) return null;
  const decoded = decodeLoop(src);
  if (decoded === null) return null;
  const lower = decoded.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('//')
  ) {
    return null;
  }
  return src;
}

export function validateSocialUrl(value: string): boolean {
  return isHttpsUrl(value);
}
