import { decideUrl } from '../../../internal/utils/urlPolicy';
import { throwIfDocxAborted } from '../../internal/abort';
import {
  DEFAULT_DOCX_IMPORT_LIMITS,
  DocxPackageError,
  readBoundedDocxPackage,
  resolveDocxImportLimits,
} from '../../internal/docxPackage';
import {
  describeDocxSourceViolation,
  detectRasterType,
  findDocxSourceViolations,
  isDocxHyperlinkTarget,
} from '../../internal/sourceEligibility';
import type { DocxDiagnostic, DocxErrorDiagnostic } from '../../internal/types';
import { imageToBase64 } from './internal/xml-builder';

// Raster types Word displays; the writer declares a content type for each.
const WORD_RASTER_TYPES: ReadonlySet<string> = new Set([
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
]);

// Written output is ours, so import limits do not bound it.
const OUTPUT_LIMITS = resolveDocxImportLimits(
  Object.fromEntries(
    Object.keys(DEFAULT_DOCX_IMPORT_LIMITS).map((limit) => [
      limit,
      Number.MAX_SAFE_INTEGER,
    ])
  )
);

const signatureBytes = (base64: string) => {
  try {
    return Uint8Array.from(atob(base64.slice(0, 24)), (character) =>
      character.charCodeAt(0)
    );
  } catch {
    return new Uint8Array();
  }
};

// Embedded bytes of a Word raster type, or why the image cannot be written.
const resolveImage = async (
  source: string,
  allowRemoteImages: boolean
): Promise<Readonly<{ reason: string }> | Readonly<{ src: string }>> => {
  const decision = decideUrl('image', source);

  if (!decision.ok) {
    return {
      reason:
        decision.reason === 'empty'
          ? 'it has no source'
          : 'its source is unsafe or malformed',
    };
  }
  let base64: string;

  if (/^data:/iu.test(decision.url)) {
    base64 = decision.url.slice(decision.url.indexOf(',') + 1);
  } else if (/^https?:/iu.test(decision.url)) {
    if (!allowRemoteImages) {
      return {
        reason: 'remote images are fetched only with allowRemoteImages',
      };
    }
    try {
      base64 = await imageToBase64(decision.url);
    } catch {
      return { reason: 'its remote source could not be fetched' };
    }
  } else {
    return { reason: 'a relative or blob source has no file to embed' };
  }
  const type = detectRasterType(signatureBytes(base64));

  if (!type || !WORD_RASTER_TYPES.has(type)) {
    return { reason: 'Word cannot display its format' };
  }

  return { src: `data:${type};base64,${base64}` };
};

// The span keeps the label, formatting and any heading bookmark id.
const replaceWithSpan = (anchor: Element) => {
  const span = anchor.ownerDocument.createElement('span');

  for (const attribute of Array.from(anchor.attributes)) {
    if (attribute.name !== 'href') {
      span.setAttribute(attribute.name, attribute.value);
    }
  }
  span.append(...Array.from(anchor.childNodes));
  anchor.replaceWith(span);
};

/**
 * Keep only link destinations and images DOCX can write safely before the
 * writer reads the static markup. A removed destination keeps its label; an
 * omitted image leaves its alt text.
 */
export const prepareDocxOutput = async (
  html: string,
  {
    allowRemoteImages = false,
    signal,
  }: Readonly<{ allowRemoteImages?: boolean; signal?: AbortSignal }>
): Promise<
  Readonly<{ diagnostics: readonly DocxDiagnostic[]; html: string }>
> => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const diagnostics: DocxDiagnostic[] = [];
  let changed = false;

  for (const anchor of Array.from(document.querySelectorAll('a'))) {
    const href = (anchor.getAttribute('href') ?? '').replace(/^ +| +$/gu, '');

    // A bookmark link becomes a Word anchor, not a relationship.
    if (href.length > 1 && href.startsWith('#')) continue;
    if (isDocxHyperlinkTarget(href)) {
      if (anchor.getAttribute('href') !== href) {
        anchor.setAttribute('href', href);
        changed = true;
      }
      continue;
    }
    if (href !== '' && href !== '#') {
      diagnostics.push({
        action: 'unwrapped',
        code: 'unsupported-content',
        feature: 'link',
        message: decideUrl('navigation', href).ok
          ? 'A relative link has no document base in DOCX, so its text was kept without the destination.'
          : 'An unsafe link destination was removed and its text was kept.',
        severity: 'warning',
      });
    }
    replaceWithSpan(anchor);
    changed = true;
  }

  for (const image of Array.from(document.querySelectorAll('img'))) {
    const source = image.getAttribute('src') ?? '';
    const resolution = await resolveImage(source, allowRemoteImages);

    throwIfDocxAborted(signal);
    if ('src' in resolution) {
      if (resolution.src !== source) {
        image.setAttribute('src', resolution.src);
        changed = true;
      }
      continue;
    }
    diagnostics.push({
      code: 'resource-omitted',
      feature: 'image',
      message: `An image was omitted because ${resolution.reason}.`,
      severity: 'warning',
    });
    const alt = image.getAttribute('alt')?.trim();

    if (alt) image.replaceWith(alt);
    else image.remove();
    changed = true;
  }

  return Object.freeze({
    diagnostics: Object.freeze(diagnostics),
    html: changed ? document.body.innerHTML : html,
  });
};

/**
 * Check written output against the same passive vocabulary that admits a
 * retained source, so nothing unsafe leaves the exporter.
 */
export const checkDocxOutput = async (
  blob: Blob,
  signal?: AbortSignal
): Promise<DocxErrorDiagnostic | null> => {
  let violations: ReturnType<typeof findDocxSourceViolations>;

  try {
    violations = findDocxSourceViolations(
      await readBoundedDocxPackage(blob, OUTPUT_LIMITS, signal)
    );
  } catch (error) {
    if (error instanceof DocxPackageError) return error.diagnostic;

    throw error;
  }
  const [violation] = violations;

  return violation
    ? Object.freeze({
        code: 'invalid-package' as const,
        message: `The generated DOCX was withheld because ${describeDocxSourceViolation(
          violation
        )}.`,
        part: violation.part,
        severity: 'error' as const,
      })
    : null;
};
