import type { Html, PhrasingContent, Root, RootContent } from 'mdast';
import { type ErrorCodes, Tokenizer } from 'parse5';

import { decideUrl } from '../../../internal/utils/urlPolicy';
import {
  decideHtmlAttribute,
  HTML_SURROUNDING_WHITESPACE,
} from '../../../lib/plugins/html/htmlSafety';
import { isMarkdownBreakHtml } from './markdownIntrinsics';
import { isMarkdownLineListToken } from './markdownLine';
import { getMarkdownTagRepair } from './markdownTags';

// Each of these tags reads its content in the tokenizer's data state, so one
// tokenizer pass reads the value as a browser does.
const RAW_HTML_TAGS: ReadonlySet<string> = new Set(
  `a abbr b bdo blockquote br caption center cite code col colgroup dd del
  details dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img
  ins kbd li mark ol p picture pre q rp rt ruby s samp small source span
  strike strong sub summary sup table tbody td tfoot th thead tr tt u ul
  var wbr`.split(/\s+/)
);

// No `class`, `id` or `style`, so a file's HTML cannot reach the app's CSS or
// collide with its element ids.
const RAW_HTML_ATTRIBUTES: ReadonlySet<string> = new Set(
  `align alt border cellpadding cellspacing cite colspan datetime dir
  height href lang media open rel reversed rowspan scope src srcset start
  target title type valign width`.split(/\s+/)
);

type Decision<Reason extends string> =
  | Readonly<{ ok: false; reason: Reason }>
  | Readonly<{ ok: true }>;

const PASS = Object.freeze({ ok: true as const });
const refuse = <Reason extends string>(reason: Reason) =>
  Object.freeze({ ok: false as const, reason });

type RawHtmlRefusal =
  | `attr:${string}`
  | 'doctype'
  | `parse:${ErrorCodes}`
  | `safety:${string}`
  | `tag:${string}`
  | 'url:cite'
  | 'url:srcset';

export type RawHtmlDecision = Decision<RawHtmlRefusal>;

// HTML's image candidate grammar: a URL runs to whitespace, a comma that ends
// the URL ends its candidate, and descriptors run to the next comma. So a
// comma inside a `data:` URL splits nothing.
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
      // A browser drops a candidate whose density is below zero or overflows.
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
  // The HTML floor reads neither attribute as a URL: it keeps any `cite` and
  // removes every `srcset`.
  if (name === 'cite') {
    return decideUrl('navigation', value).ok ? undefined : 'url:cite';
  }
  if (name === 'srcset') {
    return hasOnlySafeImageCandidates(value) ? undefined : 'url:srcset';
  }
  const decision = decideHtmlAttribute(tag, name, value);

  // The writer prints the stored value, not the floor's, so the floor may
  // only trim it.
  return !decision ||
    ('value' in decision &&
      decision.value === value.replaceAll(HTML_SURROUNDING_WHITESPACE, ''))
    ? undefined
    : `safety:${name}`;
};

export const decideRawHtml = (value: string): RawHtmlDecision => {
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
      // parse5 reports a NUL, a repeated attribute and an unclosed comment as
      // parse errors.
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

export type MarkdownReader = (source: string) => Root;

export type RawHtmlFlowContainer = 'document' | 'listItem' | 'quote';

export type RawHtmlContainer =
  | RawHtmlFlowContainer
  | 'atxHeading'
  | 'footnoteDefinition'
  | 'registeredTag'
  | 'setextHeading'
  | 'tableCell'
  | 'taskItemFirstParagraph';

export type RawHtmlPlace =
  | Readonly<{
      container: RawHtmlContainer;
      /** What the writer prints after the piece before the next line ending. */
      next: 'break' | 'none' | 'text';
      start: 'block' | 'line' | 'mid';
      wholeBlock?: false;
    }>
  | Readonly<{
      container: RawHtmlFlowContainer;
      follows: 'block' | 'list' | 'marker';
      /** The writer prints the piece as a flow `html` node of its container. */
      wholeBlock: true;
    }>;

type RawHtmlPlacementRefusal =
  | RawHtmlRefusal
  | 'block-shape'
  | 'char'
  | 'empty'
  | 'flow-shape'
  | 'footnote'
  | 'inline-shape'
  | 'line-ending'
  | 'opens-block';

export type RawHtmlPlacementDecision = Decision<RawHtmlPlacementRefusal>;

const ONE_LINE_CONTAINERS: ReadonlySet<RawHtmlContainer> = new Set([
  'atxHeading',
  'registeredTag',
  'setextHeading',
  'tableCell',
]);
const PREFIXED_CONTAINERS: ReadonlySet<RawHtmlContainer> = new Set([
  'atxHeading',
  'tableCell',
  'taskItemFirstParagraph',
]);

const isRawHtml = (node: PhrasingContent | RootContent): node is Html =>
  node.type === 'html' &&
  !getMarkdownTagRepair(node) &&
  !isMarkdownBreakHtml(node.value);

const readsAsHtmlBlock = (read: MarkdownReader, piece: string) => {
  const [html, paragraph, ...rest] = read(`${piece}\n\nx`).children;

  return (
    html !== undefined &&
    isRawHtml(html) &&
    html.value === piece &&
    paragraph?.type === 'paragraph' &&
    rest.length === 0
  );
};

const decideInlineRead = (
  read: MarkdownReader,
  piece: string,
  container: RawHtmlContainer,
  before: string,
  after: string
): RawHtmlPlacementRefusal | undefined => {
  const [paragraph, ...rest] = read(`${before}${piece}${after}`).children;

  if (paragraph?.type !== 'paragraph' || rest.length > 0) {
    return before ? 'block-shape' : 'opens-block';
  }
  let html = '';
  let text = '';

  for (const child of paragraph.children) {
    if (
      isRawHtml(child) &&
      !(container === 'tableCell' && isMarkdownLineListToken(child))
    ) {
      html += child.value;
    } else if (child.type === 'text') text += child.value;
    else return 'inline-shape';
  }

  return html === piece && text === before + after ? undefined : 'inline-shape';
};

/**
 * Create the placement rule for one import or export call. The returned
 * function decides whether a piece writes as raw HTML at its place: the piece
 * must pass `decideRawHtml`, and plain CommonMark and the editor's import
 * reader must each read it there as raw HTML and nothing else. A whole block
 * in the document, a quote or a plain list item is read as an HTML block that
 * a blank line ends. Any other piece is read inside one paragraph between
 * stand-ins for its neighbors, so it can neither open a block nor turn into
 * Markdown syntax. Decisions are cached by piece and place for the life of the
 * returned function, so create one per call.
 */
export const createRawHtmlPlacementDecider = ({
  commonmark,
  editor,
}: Readonly<{ commonmark: MarkdownReader; editor: MarkdownReader }>) => {
  const readers = [commonmark, editor];
  const decisions = new Map<string, RawHtmlPlacementDecision>();
  const decideOnce = (
    key: string,
    piece: string,
    decideRead: (read: MarkdownReader) => RawHtmlPlacementRefusal | undefined
  ) => {
    const cached = decisions.get(key);

    if (cached) return cached;
    const safety = decideRawHtml(piece);
    let refusal: RawHtmlPlacementRefusal | undefined = safety.ok
      ? undefined
      : safety.reason;

    for (const read of readers) refusal ??= decideRead(read);
    const decision = refusal ? refuse(refusal) : PASS;

    decisions.set(key, decision);

    return decision;
  };

  return (piece: string, place: RawHtmlPlace): RawHtmlPlacementDecision => {
    const { container } = place;

    // The writer escapes the text before an `html` node as if `<` follows it,
    // and an empty piece prints no `<`.
    if (!piece) return refuse('empty');
    // The import reads every line ending as LF.
    if (piece.includes('\r')) return refuse('line-ending');
    // Plain CommonMark reads a footnote definition's line as a link definition.
    if (container === 'footnoteDefinition') return refuse('footnote');
    if (place.wholeBlock) {
      // A list item indents its later lines by its marker alone, and an
      // indented line after a list continues the list, so a leading space or
      // tab there can split the piece between two blocks.
      if (place.follows !== 'block' && /^[\t ]/.test(piece)) {
        return refuse('flow-shape');
      }

      return decideOnce(`flow\u0000${piece}`, piece, (read) =>
        readsAsHtmlBlock(read, piece) ? undefined : 'flow-shape'
      );
    }
    // A backtick can open a code span and a pipe can end a table cell before
    // the piece ends.
    if (/[`|]/.test(piece)) return refuse('char');
    if (ONE_LINE_CONTAINERS.has(container) && piece.includes('\n')) {
      return refuse('line-ending');
    }
    const { next, start } = place;
    const before =
      start === 'line'
        ? 'x\n'
        : start === 'mid' || PREFIXED_CONTAINERS.has(container)
          ? 'x'
          : '';
    const after = next === 'text' ? 'x' : next === 'break' ? '\\' : '';

    return decideOnce(
      `${container}\u0000${before}\u0000${after}\u0000${piece}`,
      piece,
      (read) => decideInlineRead(read, piece, container, before, after)
    );
  };
};
