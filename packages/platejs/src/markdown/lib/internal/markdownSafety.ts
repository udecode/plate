import type { Nodes, Parent, Root, RootContent } from 'mdast';
import { type ErrorCodes, Tokenizer } from 'parse5';

import {
  decideUrl,
  isScriptCapableUrl,
  isScriptUrl,
} from '../../../internal/utils/urlPolicy';
import {
  decideHtmlAttribute,
  HTML_SURROUNDING_WHITESPACE,
} from '../../../lib/plugins/html/htmlSafety';
import type { MarkdownDiagnostic, MarkdownSourceLocation } from '../types';

type MarkdownSafetyOptions = Readonly<{
  lossPolicy: 'allow' | 'reject';
  phase: 'parse' | 'serialize';
  report: (diagnostic: MarkdownDiagnostic) => void;
  sourceLocation?: (node: RootContent) => MarkdownSourceLocation | undefined;
}>;

const isUnsafe = (role: 'image' | 'navigation', url: string) => {
  const decision = decideUrl(role, url);

  return !decision.ok && decision.reason !== 'empty';
};

/**
 * Remove destinations no reader or page may act on from standard link, image
 * and definition syntax. Parsing runs this before any mapping reads the tree;
 * serializing runs it on the emitted tree. A link keeps its label and an image
 * its alt text; an empty destination is unresolved, not unsafe.
 */
export const cleanMarkdownDestinations = (
  tree: Root,
  { lossPolicy, phase, report, sourceLocation }: MarkdownSafetyOptions
) => {
  // A link or definition keeps its label, so losing its destination warns
  // under every policy; a lost image follows the loss policy.
  const reportRemoval = (
    node: RootContent,
    impact: 'lossless' | 'lossy',
    message: string
  ) =>
    report({
      code: 'markdown-unsafe-content',
      impact,
      message,
      nodeType: node.type,
      phase,
      severity:
        impact === 'lossless' || lossPolicy === 'allow' || node.type !== 'image'
          ? 'warning'
          : 'error',
      source: sourceLocation?.(node),
    });
  const clean = (parent: { children: Parent['children'] }) => {
    parent.children = parent.children.flatMap((child): RootContent[] => {
      if (child.type === 'link' && isUnsafe('navigation', child.url)) {
        reportRemoval(
          child,
          isScriptCapableUrl(child.url) ? 'lossless' : 'lossy',
          'Markdown link destination is not safe to open and was removed; its label was kept.'
        );
        clean(child);

        return child.children;
      }
      if (child.type === 'definition' && isUnsafe('navigation', child.url)) {
        reportRemoval(
          child,
          isScriptCapableUrl(child.url) ? 'lossless' : 'lossy',
          'Markdown link definition is not safe to open and was removed; its references read as text.'
        );

        return [];
      }
      if (child.type === 'image' && isUnsafe('image', child.url)) {
        // A script source never rendered, so only its alt text was visible.
        reportRemoval(
          child,
          isScriptUrl(child.url) ? 'lossless' : 'lossy',
          child.alt
            ? 'Markdown image source is not an allowed image source; the image was removed and its alt text kept.'
            : 'Markdown image source is not an allowed image source; the image was removed.'
        );

        return child.alt ? [{ type: 'text', value: child.alt }] : [];
      }
      if ('children' in child) clean(child);

      return [child];
    });
    // An unwrapped label joins the text around it.
    parent.children = parent.children.reduce<Parent['children']>(
      (children, child) => {
        const previous = children.at(-1);

        if (previous?.type === 'text' && child.type === 'text') {
          children[children.length - 1] = {
            ...previous,
            value: previous.value + child.value,
          };
        } else {
          children.push(child);
        }

        return children;
      },
      []
    );
  };

  clean(tree);
};

export type MarkdownReader = (source: string) => Root;

const RAW_HTML_TAGS: ReadonlySet<string> = new Set(
  `a abbr b bdo blockquote br caption center cite code col colgroup dd del
  details dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img
  ins kbd li mark ol p picture pre q rp rt ruby s samp small source span
  strike strong sub summary sup table tbody td tfoot th thead tr tt u ul
  var wbr`.split(/\s+/)
);

const RAW_HTML_ATTRIBUTES: ReadonlySet<string> = new Set(
  `align alt border cellpadding cellspacing cite colspan datetime dir
  height href lang media open rel reversed rowspan scope src srcset start
  target title type valign width`.split(/\s+/)
);

type RawHtmlRefusal =
  | `attr:${string}`
  | 'doctype'
  | `parse:${ErrorCodes}`
  | `safety:${string}`
  | `tag:${string}`
  | 'url:cite'
  | 'url:srcset';

type RawHtmlDecision =
  | Readonly<{ ok: false; reason: RawHtmlRefusal }>
  | Readonly<{ ok: true }>;

const PASS = Object.freeze({ ok: true as const });
const refuse = (reason: RawHtmlRefusal) =>
  Object.freeze({ ok: false as const, reason });

const hasOnlySafeImageCandidates = (srcset: string) => {
  const nextUrl = /[\t\n\f\r ,]*([^\t\n\f\r ,][^\t\n\f\r ]*)/y;
  const atMostOneDescriptor =
    /[\t\n\f\r ]*(?:(?:0*[1-9]\d*w|(-?(?:\d+(?:\.\d+)?|\.\d+)(?:[Ee][+-]?\d+)?)x)[\t\n\f\r ]*)?(?:,|$)/y;
  let count = 0;

  for (
    let candidate = nextUrl.exec(srcset);
    candidate;
    candidate = nextUrl.exec(srcset)
  ) {
    const url = candidate[1].replace(/,+$/, '');

    if (!decideUrl('image', url).ok) return false;
    if (url === candidate[1]) {
      atMostOneDescriptor.lastIndex = nextUrl.lastIndex;
      const descriptor = atMostOneDescriptor.exec(srcset);
      const density = Number(descriptor?.[1] ?? 0);

      if (!descriptor || !(Number.isFinite(density) && density >= 0)) {
        return false;
      }
      nextUrl.lastIndex = atMostOneDescriptor.lastIndex;
    }
    count += 1;
  }

  return count > 0;
};

const decideRawHtmlAttribute = (
  tag: string,
  name: string,
  value: string
): RawHtmlRefusal | undefined => {
  if (!(RAW_HTML_ATTRIBUTES.has(name) || (name === 'name' && tag === 'a'))) {
    return `attr:${name}`;
  }
  if (name === 'cite') {
    return decideUrl('navigation', value).ok ? undefined : 'url:cite';
  }
  if (name === 'srcset') {
    return hasOnlySafeImageCandidates(value) ? undefined : 'url:srcset';
  }
  const decision = decideHtmlAttribute(tag, name, value);

  return !decision ||
    ('value' in decision &&
      decision.value === value.replaceAll(HTML_SURROUNDING_WHITESPACE, ''))
    ? undefined
    : `safety:${name}`;
};

const decideRawHtml = (value: string): RawHtmlDecision => {
  let refusal: RawHtmlRefusal | undefined;
  const ignore = () => {};

  new Tokenizer(
    {},
    {
      onCharacter: ignore,
      onComment: ignore,
      onDoctype: () => {
        refusal ??= 'doctype';
      },
      onEndTag: ({ tagName }) => {
        if (!RAW_HTML_TAGS.has(tagName)) refusal ??= `tag:${tagName}`;
      },
      onEof: ignore,
      onNullCharacter: ignore,
      onParseError: ({ code }) => {
        refusal ??= `parse:${code}`;
      },
      onStartTag: ({ attrs, tagName }) => {
        if (!RAW_HTML_TAGS.has(tagName)) refusal ??= `tag:${tagName}`;
        for (const { name, value: attribute } of attrs) {
          refusal ??= decideRawHtmlAttribute(tagName, name, attribute);
        }
      },
      onWhitespaceCharacter: ignore,
    }
  ).write(value, true);

  return refusal ? refuse(refusal) : PASS;
};

const INLINE_MARKUP_AFTER_LT =
  /[A-Za-z][A-Za-z\d-]*(?:\s*\/?>|\s+[A-Za-z_:])|\/[A-Za-z][A-Za-z\d-]*\s*>|!(?:--|[A-Za-z]|\[CDATA\[)|\?|[A-Za-z][A-Za-z\d+.-]{1,31}:[^\0- <>]*(?:>|$)/
    .source;
const MARKUP_LT = new RegExp(`<(?=${INLINE_MARKUP_AFTER_LT})`, 'g');
const TEXT_LT = new RegExp(`<(?!${INLINE_MARKUP_AFTER_LT})`, 'g');
const TO_END_TAG_LINE =
  /^([\t ]{0,3})<(?=(?:pre|script|style|textarea)(?:[\s>]|$))/gim;
const TEX_INDENT = '    ';
const TEXT_LINE = /^(?=.*\S)/gm;
const INDENTED_TEXT_LINE = /^ {4}(?=.*\S)/gm;

const isIndentedTex = (value: string) => {
  const lines = value.split('\n').filter((line) => /\S/.test(line));

  return lines.length > 0 && lines.every((line) => line.startsWith(TEX_INDENT));
};

/**
 * A reader without math reads `$…$` and a `$$` block as Markdown text, where
 * TeX such as `<img src=x onerror=alert(1)>` is raw HTML and
 * `<javascript:alert(1)>` is a link. TeX whose tags fail the HTML check writes
 * a space after each `<` that could start a tag, and multi-block `$$` TeX
 * indents each text line by four spaces so every line reads as indented code.
 */
export const writeMathSafely = (node: Nodes, read: MarkdownReader) => {
  if (
    (node.type === 'math' || node.type === 'inlineMath') &&
    node.value.includes('<')
  ) {
    const after = node.type === 'math' ? '\n$$' : '$';
    const written = `${node.value}${after}`;

    if (!decideRawHtml(written.replaceAll(TEXT_LT, '&lt;')).ok) {
      node.value = written.replaceAll(MARKUP_LT, '< ').slice(0, -after.length);
    }
  }
  if (node.type === 'math') {
    node.value = node.value.replaceAll(TO_END_TAG_LINE, '$1< ');
    const [first, ...rest] = read(`$$\n${node.value}\n$$`).children;

    if (
      (/\S/.test(node.value) &&
        (first?.type !== 'paragraph' || rest.length > 0)) ||
      isIndentedTex(node.value)
    ) {
      node.value = node.value.replaceAll(TEXT_LINE, TEX_INDENT);
    }
  }
  if ('children' in node) {
    for (const child of node.children) writeMathSafely(child, read);
  }
};

export const readMathSafely = (node: Nodes) => {
  if (node.type === 'math' && isIndentedTex(node.value)) {
    node.value = node.value.replaceAll(INDENTED_TEXT_LINE, '');
  }
  if ('children' in node) node.children.forEach(readMathSafely);
};
