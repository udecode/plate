import { isStoredUrl } from '../../../internal/utils/urlPolicy';

const CSS_PIXELS_RE = /^(\d+(?:\.\d+)?)px$/;
const PROVIDER_ATTRIBUTE = 'data-editor-media-provider';
const SOURCE_URL_ATTRIBUTE = 'data-editor-media-source-url';

/** Write a stored media width as CSS: a number is a pixel length. */
export const writeHtmlMediaWidth = (width: number | string | undefined) =>
  typeof width === 'number' ? `${width}px` : width;

/**
 * Read a CSS media width. A pixel length reads back as the number the editor
 * stores; any other length, such as a percentage, stays a string.
 */
export const readHtmlMediaWidth = (value: string | null | undefined) => {
  if (!value) return undefined;
  const pixels = CSS_PIXELS_RE.exec(value)?.[1];

  return pixels === undefined ? value : Number(pixels);
};

/** Attributes that carry a media element's provider and source page. */
export const writeHtmlMediaProvider = (
  node: Readonly<{ provider?: string; sourceUrl?: string }>
) => ({
  [PROVIDER_ATTRIBUTE]: node.provider,
  [SOURCE_URL_ATTRIBUTE]: node.sourceUrl,
});

/**
 * Read the provider attributes. A source page this editor cannot store is
 * reported and left out.
 */
export const readHtmlMediaProvider = (
  element: Element,
  {
    preserve,
    report,
  }: Readonly<{
    preserve: (...attributes: readonly string[]) => void;
    report: (
      diagnostic: Readonly<{
        action: 'dropped';
        kind: 'attribute';
        message: string;
      }>
    ) => void;
  }>
) => {
  const provider = element.getAttribute(PROVIDER_ATTRIBUTE);
  const sourceUrl = element.getAttribute(SOURCE_URL_ATTRIBUTE);
  const validSourceUrl =
    sourceUrl !== null && isStoredUrl('navigation')(sourceUrl);

  if (provider !== null) preserve(PROVIDER_ATTRIBUTE);
  // A stored source page is kept, and any other is reported here.
  if (sourceUrl !== null) preserve(SOURCE_URL_ATTRIBUTE);
  if (sourceUrl !== null && !validSourceUrl) {
    report({
      action: 'dropped',
      kind: 'attribute',
      message: `HTML media source page "${sourceUrl}" is not a link this editor stores; it was omitted.`,
    });
  }

  return {
    ...(provider === null ? {} : { provider }),
    ...(validSourceUrl ? { sourceUrl } : {}),
  };
};
