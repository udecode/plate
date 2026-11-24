import type {
  Heading,
  Html,
  Text as MdText,
  Nodes,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  TableCell,
} from 'mdast';
import { type ErrorCodes, Tokenizer } from 'parse5';

import type { Text } from '../../../core';
import { decideUrl } from '../../../internal/utils/urlPolicy';
import {
  decideHtmlAttribute,
  HTML_SURROUNDING_WHITESPACE,
} from '../../../lib/plugins/html/htmlSafety';
import {
  encodeRawHtmlLeaves,
  isMarkdownBreakHtml,
  isMarkdownHtmlComment,
  markRawHtmlFlow,
  rawHtmlPieceOf,
  wholeHtmlBlockRefusal,
} from './markdownIntrinsics';
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

const INLINE_MARKUP_AFTER_LT =
  /[A-Za-z][A-Za-z\d-]*(?:\s*\/?>|\s+[A-Za-z_:])|\/[A-Za-z][A-Za-z\d-]*\s*>|!(?:--|[A-Za-z]|\[CDATA\[)|\?|[A-Za-z][A-Za-z\d+.-]{1,31}:[^\0- <>]*(?:>|$)/
    .source;
const MARKUP_LT = new RegExp(`<(?=${INLINE_MARKUP_AFTER_LT})`, 'g');
const TEXT_LT = new RegExp(`<(?!${INLINE_MARKUP_AFTER_LT})`, 'g');
// A line that opens an HTML block running to its end tag, past the closing
// `$$`, whether or not the tag is whole.
const TO_END_TAG_LINE =
  /^([\t ]{0,3})<(?=(?:pre|script|style|textarea)(?:[\s>]|$))/gim;
const TEX_INDENT = '    ';
// CommonMark reads a line of spaces as blank whatever its indent, and a
// footnote's container indent never comes off it, so only lines with text
// take the indent.
const TEXT_LINE = /^(?=.*\S)/gm;
const INDENTED_TEXT_LINE = /^ {4}(?=.*\S)/gm;
const isIndentedTex = (value: string) => {
  const lines = value.split('\n').filter((line) => /\S/.test(line));

  return lines.length > 0 && lines.every((line) => line.startsWith(TEX_INDENT));
};

/**
 * A reader without math reads `$…$` and a `$$` block as Markdown text, where
 * TeX such as `<img src=x onerror=alert(1)>` is raw HTML and
 * `<javascript:alert(1)>` is a link, and a tag the TeX leaves open takes its
 * `>` from the text after it. TeX whose tags the raw HTML rule refuses writes
 * a space after each `<` that could start a tag, which TeX ignores in math
 * mode. A `$$` block that CommonMark does not read as one paragraph, such as
 * TeX holding a blank line and then `[a]: javascript:alert(1)`, indents each
 * TeX line that holds text by four spaces, so every line reads as paragraph
 * text or indented code.
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
  | 'comment'
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
      if (isMarkdownHtmlComment(child.value)) return 'comment';
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
      const refusal = wholeHtmlBlockRefusal(piece, place.follows);

      if (refusal) return refuse(refusal);

      return decideOnce(`flow\u0000${piece}`, piece, (read) =>
        readsAsHtmlBlock(read, piece) ? undefined : 'flow-shape'
      );
    }
    // Import keeps a comment only as an HTML block of its own.
    if (isMarkdownHtmlComment(piece)) return refuse('comment');
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

type MdParent = Extract<Nodes, Readonly<{ children: unknown }>>;
type RawHtmlLeaf = Heading | Paragraph | TableCell;

type RawHtmlPiece = Readonly<{
  block: MdParent | Html;
  changed: boolean;
  node: Html;
  place: RawHtmlPlace | 'unmodeled';
  wholeParagraph?: Readonly<{ paragraph: Paragraph; place: RawHtmlPlace }>;
}>;

type LeafWriting = Readonly<{
  /** The writer prints a final space or tab as a character reference. */
  finalReference: boolean;
  /** The writer prints a break or a line ending in text as a new line. */
  lineEndings: boolean;
}>;

const FLOW_PARENTS: ReadonlySet<string> = new Set([
  'blockquote',
  'footnoteDefinition',
  'list',
  'listItem',
  'mdxJsxFlowElement',
  'table',
  'tableRow',
]);

const isPiece = (node: Nodes): node is Html =>
  rawHtmlPieceOf(node) !== undefined;
const leavesOf = (node: Html) => rawHtmlPieceOf(node)?.leaves ?? [];
const isChanged = (node: Html) =>
  node.value !==
  leavesOf(node)
    .map((leaf) => leaf.text)
    .join('');
const isBreak = (node: Nodes) =>
  node.type === 'break' ||
  (node.type === 'html' && isMarkdownBreakHtml(node.value));
const isText = (node: Nodes): node is Html | MdText =>
  node.type === 'html' || node.type === 'text';
export const printsNoText = (node: Nodes): boolean =>
  isText(node)
    ? node.value === ''
    : node.type === 'table'
      ? node.children.every((row) => row.children.length === 0)
      : node.type === 'list' || node.type === 'tableRow'
        ? node.children.length === 0
        : (node.type === 'emphasis' ||
            node.type === 'paragraph' ||
            node.type === 'strong' ||
            node.type === 'tableCell') &&
          node.children.every(printsNoText);
const isWhitespace = (node: Nodes) =>
  node.type === 'text' && /^[\t ]+$/.test(node.value);
// The writer escapes a space or tab only when it sees the line ending next to
// it, and it does not see the one an `html` node holds.
const isBlank = (node: Nodes) => printsNoText(node) || isWhitespace(node);
// The writer prints the line ending an `html` node holds as it is, which ends
// an ATX heading or a table row.
const holdsHtmlLineEnding = (node: Nodes): boolean =>
  (node.type === 'html' && /[\n\r]/.test(node.value)) ||
  ('children' in node && node.children.some(holdsHtmlLineEnding));
const holdsLineEnding = (node: Nodes, ending: RegExp): boolean =>
  node.type === 'break' ||
  ('value' in node && ending.test(node.value)) ||
  ('children' in node &&
    node.children.some((child) => holdsLineEnding(child, ending)));

/**
 * Merge each run of adjacent unchanged pieces in phrasing into one node that
 * holds all their leaves. The writer turns a line ending before most `html`
 * nodes into a space, so only one node prints the leaves' own text.
 */
const mergeAdjacentPieces = (parent: MdParent) => {
  const children = parent.children as Nodes[];
  const phrasing = parent.type !== 'root' && !FLOW_PARENTS.has(parent.type);

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if ('children' in child) mergeAdjacentPieces(child);
    if (!phrasing) continue;
    let end = index;

    while (end < children.length && isPiece(children[end])) end += 1;
    const run = children.slice(index, end) as Html[];

    if (run.length < 2) continue;
    if (run.some(isChanged)) {
      index = end - 1;
    } else {
      children.splice(
        index,
        run.length,
        encodeRawHtmlLeaves(run.flatMap(leavesOf))
      );
    }
  }
};

type RawHtmlTreeOptions = Readonly<{
  previousKind?: string;
  setext: boolean;
  unwritable?: ReadonlySet<string>;
}>;

/**
 * Find each piece of marked text on the tree the writer prints, and its place
 * on the lines it prints there. A piece is one `html` node that marked leaves
 * encode.
 */
const findRawHtmlPieces = (
  tree: Root,
  { previousKind, setext, unwritable }: RawHtmlTreeOptions
): RawHtmlPiece[] => {
  const pieces: RawHtmlPiece[] = [];
  const pushPiece = (
    node: Html,
    block: RawHtmlPiece['block'],
    place: RawHtmlPiece['place'] = 'unmodeled'
  ) => {
    pieces.push({ block, changed: isChanged(node), node, place });
  };
  const visitUnknown = (parent: MdParent, block: MdParent) => {
    for (const child of parent.children) {
      if (isPiece(child)) pushPiece(child, block);
      else if ('children' in child) visitUnknown(child, block);
    }
  };
  const visitPhrasing = (
    parent: MdParent,
    container: RawHtmlContainer,
    leaf: RawHtmlLeaf,
    writing: LeafWriting
  ) => {
    const children = parent.children as PhrasingContent[];
    const atLeaf = parent === leaf;
    const last = children.at(-1);
    const endsInReference =
      atLeaf &&
      writing.finalReference &&
      last !== undefined &&
      isWhitespace(last);
    let before: Nodes | undefined;

    for (const [index, child] of children.entries()) {
      if (!isPiece(child)) {
        if ('children' in child) {
          visitPhrasing(
            child,
            child.type === 'mdxJsxTextElement' &&
              container !== 'footnoteDefinition'
              ? 'registeredTag'
              : container,
            leaf,
            writing
          );
        }
        if (!printsNoText(child)) before = child;
        continue;
      }
      let afterIndex = index + 1;

      while (afterIndex < children.length && isBlank(children[afterIndex])) {
        afterIndex += 1;
      }
      const after = children.at(afterIndex);
      const nextOf = () => {
        if (!after) return !atLeaf || endsInReference ? 'text' : 'none';
        if (
          writing.lineEndings &&
          isText(after) &&
          /^[\n\r]/.test(after.value)
        ) {
          return 'none';
        }
        if (!isBreak(after) || leaf.type === 'tableCell') return 'text';

        return leaf.type === 'heading' ? 'none' : 'break';
      };
      const startOf = () => {
        if (!before) return atLeaf ? 'block' : 'mid';

        return writing.lineEndings &&
          (before.type === 'break' ||
            (isText(before) && /[\n\r]$/.test(before.value)))
          ? 'line'
          : 'mid';
      };

      pushPiece(child, leaf, { container, next: nextOf(), start: startOf() });
      before = child;
    }
  };
  const visitFlow = (
    parent: MdParent,
    container: RawHtmlFlowContainer,
    // A quote inside either prints on lines the outer container prefixes.
    outer?: 'footnoteDefinition' | 'registeredTag'
  ) => {
    const inFootnote = outer === 'footnoteDefinition' ? outer : undefined;
    let follows: Extract<RawHtmlPlace, { wholeBlock: true }>['follows'] =
      parent.type === 'listItem'
        ? 'marker'
        : parent === tree && previousKind === 'list'
          ? 'list'
          : 'block';

    for (const [index, child] of parent.children.entries()) {
      const flowPlace = { container, follows, wholeBlock: true } as const;

      if (isPiece(child)) {
        pushPiece(
          child,
          child,
          outer ? { container: outer, next: 'none', start: 'block' } : flowPlace
        );
      } else if (child.type === 'heading') {
        const setextHeading =
          child.depth < 3 && (setext || holdsLineEnding(child, /[\n\r]/));

        if (!setextHeading && holdsHtmlLineEnding(child)) {
          visitUnknown(child, child);
        } else {
          visitPhrasing(
            child,
            inFootnote ?? (setextHeading ? 'setextHeading' : 'atxHeading'),
            child,
            { finalReference: true, lineEndings: setextHeading }
          );
        }
      } else if (child.type === 'paragraph') {
        const taskItemFirstParagraph =
          index === 0 &&
          parent.type === 'listItem' &&
          typeof parent.checked === 'boolean';
        // The `mdxJsxFlowElement` handler in markdownTags.ts keeps one
        // paragraph that prints no line feed on the tag's line, and there a
        // final space or tab prints as it is.
        const onTagLine =
          parent.type === 'mdxJsxFlowElement' &&
          parent.children.length === 1 &&
          !holdsLineEnding(child, /\n/);
        const first = pieces.length;

        visitPhrasing(
          child,
          outer ??
            (taskItemFirstParagraph ? 'taskItemFirstParagraph' : container),
          child,
          { finalReference: !onTagLine, lineEndings: true }
        );
        if (
          !outer &&
          !taskItemFirstParagraph &&
          child.children.length > 0 &&
          child.children.every(isPiece)
        ) {
          pieces[first] = {
            ...pieces[first],
            wholeParagraph: { paragraph: child, place: flowPlace },
          };
        }
      } else if (
        child.type === 'tableCell' &&
        // The table writer prints a cell outside a row with no pipe before it.
        (parent.type !== 'tableRow' || holdsHtmlLineEnding(child))
      ) {
        visitUnknown(child, child);
      } else if (child.type === 'tableCell') {
        visitPhrasing(child, inFootnote ?? 'tableCell', child, {
          finalReference: false,
          lineEndings: false,
        });
      } else if (FLOW_PARENTS.has(child.type) && 'children' in child) {
        visitFlow(
          child,
          child.type === 'blockquote'
            ? 'quote'
            : child.type === 'listItem'
              ? 'listItem'
              : container,
          child.type === 'footnoteDefinition'
            ? child.type
            : child.type === 'mdxJsxFlowElement'
              ? (outer ?? 'registeredTag')
              : outer
        );
      } else if ('children' in child) {
        visitUnknown(child, child);
      }
      if (!printsNoText(child) && !unwritable?.has(child.type)) {
        follows = child.type === 'list' ? 'list' : 'block';
      }
    }
  };

  visitFlow(tree, 'document');

  return pieces;
};

export type RawHtmlBlockRefusal = Readonly<{
  leaves: readonly Text[];
  reason: string;
}>;

/**
 * Decide each block of marked text on the tree the writer prints. A block is
 * the nearest paragraph, heading or table cell, a flow `html` node, or a node
 * in flow position whose printing the decision does not model. It fails when
 * any piece in it fails, and a piece fails when its node no longer holds its
 * leaves' text, when its block is one the decision does not model, or when
 * the placement rule refuses it at its place. A paragraph that holds only one
 * piece also passes as an HTML block, which the writer then sets apart with
 * blank lines, or from the next item of its list with that item's marker line.
 */
export const decideRawHtmlBlocks = (
  tree: Root,
  decide: (piece: string, place: RawHtmlPlace) => Decision<string>,
  options: RawHtmlTreeOptions
): RawHtmlBlockRefusal[] => {
  const blocks = new Map<
    RawHtmlPiece['block'],
    { leaves: Text[]; reason?: string }
  >();

  mergeAdjacentPieces(tree);
  for (const {
    block,
    changed,
    node,
    place,
    wholeParagraph,
  } of findRawHtmlPieces(tree, options)) {
    const decided = blocks.get(block) ?? { leaves: [] };

    decided.leaves.push(...leavesOf(node));
    blocks.set(block, decided);
    if (decided.reason) continue;
    if (changed) decided.reason = 'changed';
    else if (place === 'unmodeled') decided.reason = 'container';
    else if (wholeParagraph && decide(node.value, wholeParagraph.place).ok) {
      markRawHtmlFlow(wholeParagraph.paragraph);
    } else {
      const decision = decide(node.value, place);

      if (!decision.ok) decided.reason = decision.reason;
    }
  }

  return [...blocks.values()].flatMap(({ leaves, reason }) =>
    reason ? [{ leaves, reason }] : []
  );
};
