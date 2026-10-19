import {
  decideUrl,
  isScriptCapableUrl,
  isScriptUrl,
  type UrlRole,
} from '../../../internal/utils/urlPolicy';
import { isHtmlElement } from './htmlDom';

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

/** Elements removed with their subtree wherever HTML is read or written. */
export const HTML_UNSAFE_TAGS: ReadonlySet<string> = new Set([
  'base',
  'embed',
  'link',
  'meta',
  'object',
  'script',
  'style',
]);

// Removing these renders nothing less: metadata, scripts and style sheets.
const NON_RENDERING_TAGS = new Set(['base', 'link', 'meta', 'script', 'style']);
const HTML_SURROUNDING_WHITESPACE = /^[\t\n\f\r ]+|[\t\n\f\r ]+$/gu;
const CSS_RESOURCE = /(?:\burl\s*\(|\bimage-set\s*\(|\bsrc\s*\(|@import\b)/iu;
const CSS_ESCAPE = /\\(?:([\da-f]{1,6})[\t\n\f\r ]?|([^\n\f\r\da-f]))/giu;

export type HtmlUnsafeRemoval = Readonly<{
  /**
   * `unwrapped` when a link loses its destination and keeps its label, a loss
   * that warns under every policy; `removed` otherwise.
   */
  action: 'removed' | 'unwrapped';
  /** Whether the removal also dropped content a reader would have seen. */
  impact: 'lossless' | 'lossy';
  kind: 'attribute' | 'element' | 'style' | 'url';
  message: string;
}>;

/** Keep the attribute, keep it with a normalized value, or remove it. */
type HtmlAttributeDecision =
  | Readonly<{ removal: HtmlUnsafeRemoval }>
  | Readonly<{ value: string }>
  | undefined;

const urlRole = (tag: string, name: string): UrlRole | undefined => {
  if (name === 'href' || name === 'xlink:href') return 'navigation';
  if (name === 'poster') return 'image';
  if (name !== 'src') return undefined;
  if (tag === 'img') return 'image';

  return tag === 'iframe' || tag === 'frame' ? 'embed' : 'media';
};

// A CSS escape can spell `url(` without the letters appearing in the source.
const decodeCssEscapes = (value: string) =>
  value.replaceAll(
    CSS_ESCAPE,
    (_, hex: string | undefined, character: string | undefined) => {
      if (hex === undefined) return character ?? '';
      const codePoint = Number.parseInt(hex, 16);

      return String.fromCodePoint(
        codePoint === 0 ||
          codePoint > 0x10_ff_ff ||
          (codePoint >= 0xd8_00 && codePoint <= 0xdf_ff)
          ? 0xff_fd
          : codePoint
      );
    }
  );

const isResourceBearingCss = (value: string) =>
  CSS_RESOURCE.test(decodeCssEscapes(value));

/**
 * Decide whether an element is removed with its subtree. `isDecorative` is
 * read only for a removal: content hidden from assistive technology is not
 * content a reader loses.
 */
export const decideHtmlElement = (
  namespace: string | null,
  tag: string,
  isDecorative: () => boolean
): HtmlUnsafeRemoval | undefined => {
  const isHtml = namespace === HTML_NAMESPACE;

  if (isHtml && !HTML_UNSAFE_TAGS.has(tag)) return undefined;

  return Object.freeze({
    action: 'removed' as const,
    impact:
      (isHtml && NON_RENDERING_TAGS.has(tag)) || isDecorative()
        ? ('lossless' as const)
        : ('lossy' as const),
    kind: 'element' as const,
    message: `Removed unsafe HTML element <${tag}>.`,
  });
};

/**
 * Decide one attribute by its sink: `href` navigates, `src` and `poster` load
 * a resource of the element's role, and handlers, inline documents, form
 * targets, image candidate lists and resource-bearing CSS never survive.
 */
export const decideHtmlAttribute = (
  tag: string,
  rawName: string,
  value: string
): HtmlAttributeDecision => {
  const name = rawName.toLowerCase();
  const remove = (
    kind: HtmlUnsafeRemoval['kind'],
    impact: HtmlUnsafeRemoval['impact'],
    action: HtmlUnsafeRemoval['action'] = 'removed'
  ) =>
    Object.freeze({
      removal: Object.freeze({
        action,
        impact,
        kind,
        message: `Removed unsafe HTML attribute "${rawName}" from <${tag}>.`,
      }),
    });

  if (name.startsWith('on')) return remove('attribute', 'lossless');
  if (name === 'srcdoc') return remove('attribute', 'lossy');
  if (name === 'action' || name === 'formaction' || name === 'srcset') {
    return remove('url', 'lossless');
  }
  if (name === 'style') {
    return isResourceBearingCss(value) ? remove('style', 'lossy') : undefined;
  }
  const role = urlRole(tag, name);

  if (!role) return undefined;
  const url = value.replaceAll(HTML_SURROUNDING_WHITESPACE, '');
  const decision = decideUrl(role, url);

  if (decision.ok || decision.reason === 'empty') {
    return url === value ? undefined : Object.freeze({ value: url });
  }

  // A label outlives its destination, so that loss warns; only a destination
  // that could run script loses nothing. A script resource never rendered.
  return role === 'navigation'
    ? remove('url', isScriptCapableUrl(url) ? 'lossless' : 'lossy', 'unwrapped')
    : remove('url', isScriptUrl(url) ? 'lossless' : 'lossy');
};

const isAriaHidden = (element: Element) => {
  for (
    let current: Element | null = element;
    current;
    current = current.parentElement
  ) {
    if (current.getAttribute('aria-hidden')?.trim().toLowerCase() === 'true') {
      return true;
    }
  }

  return false;
};

/**
 * Remove unsafe elements and attributes from `root` and its descendants,
 * including template contents. `report` runs before each removal, while the
 * element is still in place. An image whose source is removed leaves its alt
 * text, as a browser shows for an image that cannot load.
 */
export const sanitizeHtmlDom = (
  root: Element,
  report: (element: Element, removal: HtmlUnsafeRemoval) => void
) => {
  const sanitizeAttributes = (element: Element, tag: string) => {
    let removedSource = false;

    for (const name of element.getAttributeNames()) {
      const decision = decideHtmlAttribute(
        tag,
        name,
        element.getAttribute(name) ?? ''
      );

      if (!decision) continue;
      if ('value' in decision) {
        element.setAttribute(name, decision.value);
        continue;
      }
      report(element, decision.removal);
      element.removeAttribute(name);
      removedSource ||= name.toLowerCase() === 'src';
    }

    return removedSource;
  };
  // Walk `childNodes` as decoding does, so a form control named `children`
  // cannot hide a subtree from this pass but not from the decoder.
  const sanitizeChildren = (parent: Element | DocumentFragment) => {
    for (const element of Array.from(parent.childNodes)) {
      if (!isHtmlElement(element)) continue;
      const tag = element.tagName.toLowerCase();
      const removal = decideHtmlElement(element.namespaceURI, tag, () =>
        isAriaHidden(element)
      );

      if (removal) {
        report(element, removal);
        element.remove();
        continue;
      }
      if (sanitizeAttributes(element, tag) && tag === 'img') {
        const alt = element.getAttribute('alt');

        if (alt) element.replaceWith(element.ownerDocument.createTextNode(alt));
        else element.remove();
        continue;
      }
      sanitizeContent(element, tag);
    }
  };
  const sanitizeContent = (element: Element, tag: string) => {
    sanitizeChildren(element);
    if (tag === 'template' && 'content' in element) {
      sanitizeChildren((element as HTMLTemplateElement).content);
    }
  };
  const tag = root.tagName.toLowerCase();
  const removal = decideHtmlElement(root.namespaceURI, tag, () =>
    isAriaHidden(root)
  );

  // The caller holds the root, so an unsafe root is emptied instead of removed.
  if (removal) {
    report(root, removal);
    root.replaceChildren();
    for (const name of root.getAttributeNames()) root.removeAttribute(name);

    return;
  }
  sanitizeAttributes(root, tag);
  sanitizeContent(root, tag);
};
