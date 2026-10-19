/**
 * What a URL does where it is stored or written. A navigation href is opened
 * by the reader; image, media and file sources load automatically; an embed
 * runs a third-party page.
 */
export type UrlRole = 'embed' | 'file' | 'image' | 'media' | 'navigation';

export type UrlDecision =
  | Readonly<{ ok: true; url: string }>
  | Readonly<{ ok: false; reason: 'empty' | 'malformed' | 'scheme' }>;

const SCHEME = /^([a-z][a-z\d+.-]*):/iu;
const RASTER_DATA_URL =
  /^data:image\/(?:avif|bmp|gif|jpeg|png|webp);base64,[a-z\d+/]*={0,2}$/iu;
// Script-capable destinations a reader must never open, whatever the app allows.
const NAVIGATION_FLOOR = new Set([
  'blob',
  'data',
  'filesystem',
  'javascript',
  'vbscript',
]);
const WEB_SCHEMES = new Set(['http', 'https']);
const SCRIPT_SCHEME = /^(?:javascript|vbscript):/iu;
const URL_TAB_OR_NEWLINE = /[\t\n\r]/gu;

// Browsers drop controls inside URLs and read `\` as `/`, which turns
// `java\tscript:` into a script URL and `\\host` into another origin.
const isMalformed = (url: string) => {
  for (let index = 0; index < url.length; index += 1) {
    const code = url.charCodeAt(index);

    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f) || code === 0x5c) {
      return true;
    }
    if (code >= 0xd8_00 && code <= 0xdb_ff) {
      const next = url.charCodeAt(index + 1);

      if (!(next >= 0xdc_00 && next <= 0xdf_ff)) return true;
      index += 1;
    } else if (code >= 0xdc_00 && code <= 0xdf_ff) {
      return true;
    }
  }

  return url.startsWith('//');
};

const isValidAbsolute = (url: string) => {
  try {
    return new URL(url).protocol !== '';
  } catch {
    return false;
  }
};

/**
 * Decide whether `url` may be an active destination for `role`. Only
 * surrounding spaces are trimmed; escapes are not decoded again and relative
 * URLs keep their meaning. `allowedSchemes` narrows or widens navigation
 * schemes above the floor, which always rejects script-capable schemes.
 */
export const decideUrl = (
  role: UrlRole,
  value: string,
  options: Readonly<{ allowedSchemes?: readonly string[] }> = {}
): UrlDecision => {
  const url = value.replace(/^ +| +$/gu, '');

  if (url === '') return { ok: false, reason: 'empty' };
  if (isMalformed(url)) return { ok: false, reason: 'malformed' };
  const scheme = SCHEME.exec(url)?.[1]?.toLowerCase();

  if (scheme === undefined) {
    // A colon before any `/`, `?` or `#` is a scheme, never a relative path.
    if (/^[^/?#]*:/u.test(url)) return { ok: false, reason: 'malformed' };

    return role === 'embed'
      ? { ok: false, reason: 'scheme' }
      : { ok: true, url };
  }
  const allowed = (() => {
    switch (role) {
      case 'navigation': {
        return (
          !NAVIGATION_FLOOR.has(scheme) &&
          (options.allowedSchemes?.some(
            (allowedScheme) => allowedScheme.toLowerCase() === scheme
          ) ??
            true)
        );
      }
      case 'image': {
        return (
          WEB_SCHEMES.has(scheme) ||
          scheme === 'blob' ||
          (scheme === 'data' && RASTER_DATA_URL.test(url))
        );
      }
      case 'embed': {
        return WEB_SCHEMES.has(scheme);
      }
      default: {
        return WEB_SCHEMES.has(scheme) || scheme === 'blob';
      }
    }
  })();

  if (!allowed) return { ok: false, reason: 'scheme' };
  if (scheme !== 'data' && !isValidAbsolute(url)) {
    return { ok: false, reason: 'malformed' };
  }

  return { ok: true, url };
};

/**
 * Schema validator for a stored URL of `role`. The empty string is an inert,
 * unresolved value; every other value must meet the role's floor.
 */
export const isStoredUrl =
  (role: UrlRole) =>
  (value: unknown): value is string =>
    typeof value === 'string' && (value === '' || decideUrl(role, value).ok);

/**
 * Whether `url` runs script when followed or loaded. Browsers skip leading
 * controls and drop tabs and newlines inside a URL, so `java\tscript:` counts.
 * Removing such a URL loses nothing a reader could see.
 */
export const isScriptUrl = (url: string) => {
  const collapsed = url.replaceAll(URL_TAB_OR_NEWLINE, '');
  let start = 0;

  while (start < collapsed.length && collapsed.charCodeAt(start) <= 0x20) {
    start += 1;
  }

  return SCRIPT_SCHEME.test(collapsed.slice(start));
};

/**
 * Whether a navigation destination could run script: a floor scheme such as
 * `javascript:`, `data:` or `blob:`, or a script scheme hidden by controls.
 * Removing one loses nothing a reader could follow.
 */
export const isScriptCapableUrl = (url: string) => {
  if (isScriptUrl(url)) return true;
  const decision = decideUrl('navigation', url);

  return !decision.ok && decision.reason === 'scheme';
};
