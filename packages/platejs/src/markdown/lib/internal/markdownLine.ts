import type {
  Html,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
} from 'mdast';

import { type Descendant, ElementApi, TextApi } from '../../../core';
import type { MarkdownEncodeContext } from '../../../lib/plugin/MarkdownNodeMapping';
import { convertNodesDeserialize } from '../deserializer/convertNodesDeserialize';
import type { MdRootContent } from '../mdast';
import { isMdLineContent } from '../serializer/mdastContent';
import type { DeserializeMdContext, MdMarks } from '../types';
import { ReportedMarkdownFailureError } from './markdownDiagnostics';
import { toMarkdownBlockContent } from './markdownDocument';
import {
  readEmptyParagraphMarker,
  TRAILING_BREAK_HTML,
} from './markdownIntrinsics';
import { getMarkdownDecoders, runMarkdownDecoders } from './markdownMappings';

type LineWriter = Readonly<{
  report: MarkdownEncodeContext['report'];
  resourceLink: boolean;
}>;

type LineSegment = Readonly<{
  kind: 'block' | 'list' | 'text';
  phrasing: PhrasingContent[];
}>;

const LINE_ENDING = /\r\n|\r|\n/;
const LINE_ENDINGS = /\r\n|\r|\n/g;
// KaTeX's lexer: `\verb*` takes any delimiter, `\verb` any but a letter or `*`.
const TEX_TOKEN =
  /\\verb\*([^])(.*?)\1|\\verb([^*a-zA-Z])(.*?)\3|\\[A-Za-z]+|\\.|[{}|$]/g;
const TEXT_MODE_COMMAND =
  /^\\(?:text(?:bf|it|md|normal|rm|sf|tt|up)?|emph|hbox)$/;
// Commands whose braced arguments KaTeX reads in the surrounding math mode.
const MATH_MODE_COMMAND =
  /^\\(?:[cdt]?frac|[dt]?binom|sqrt|(?:over|under)(?:line|brace|set)|wide(?:hat|tilde)|hat|tilde|bar|vec|dot|ddot|stackrel|boxed|math(?:bb|bf|cal|frak|it|rm|sf|tt)|boldsymbol|operatorname|textcolor)$/;
const VERB_DELIMITERS = ['!', '+', '=', ':', ';', '/', '@', '#'];
const URL_LITERAL = /^[a-z][a-z\d+.-]*:\S*$/i;

const html = (value: string): Html => ({ type: 'html', value });

// Mirrors mdast-util-to-markdown's `formatLinkAsAutolink`. It writes a `<url>`
// link without escapes, so a `|` there would end the cell.
const writesAsAutolink = (link: Link, resourceLink: boolean) => {
  const [label] = link.children;

  return (
    !resourceLink &&
    !link.title &&
    link.children.length === 1 &&
    label?.type === 'text' &&
    (label.value === link.url || `mailto:${label.value}` === link.url) &&
    /^[a-z][a-z+.-]+:/i.test(link.url) &&
    !/[\0- <>\u007F]/.test(link.url)
  );
};

const reportReplaced = (line: LineWriter, message: string, nodeType: string) =>
  line.report({
    action: 'replaced',
    kind: 'property',
    message: `Markdown writes this content on one line; ${message}`,
    nodeType,
  });

type TexMode = 'math' | 'nested-math' | 'text' | 'unknown';

const groupMode = (
  mode: TexMode,
  owner: string | undefined,
  carried: boolean
): TexMode => {
  if (owner === undefined) return mode === 'nested-math' ? 'math' : mode;
  if (mode === 'unknown') return 'unknown';
  if (TEXT_MODE_COMMAND.test(owner)) return carried ? 'unknown' : 'text';

  return MATH_MODE_COMMAND.test(owner) && mode !== 'text' ? 'math' : 'unknown';
};

// `\vert` and `\Vert` are the symbols `|` and `\|` draw in math mode, and
// `\textbar` the one `|` draws in text mode, where `{}` keeps the space after
// it. Text mode has no `\|`. A `|` makes the math unwritable where the writer
// cannot tell how KaTeX reads it, as in an argument of a command missing from
// the lists above, or where it has no escape, as in `\verb` text.
// `\verb|...|` only needs another delimiter.
const escapeTexPipes = (value: string): string | null => {
  const groups: Array<{ mode: TexMode; owner?: string }> = [];
  let previous = { end: 0, token: '' };
  let closedOwner: string | undefined;
  let writable = true;
  const escaped = value.replace(
    TEX_TOKEN,
    (
      token: string,
      starredDelimiter: string | undefined,
      starredBody: string | undefined,
      verbDelimiter: string | undefined,
      verbBody: string | undefined,
      offset: number
    ) => {
      const delimiter = starredDelimiter ?? verbDelimiter;
      const body = starredBody ?? verbBody ?? '';
      const mode = groups.at(-1)?.mode ?? 'math';
      const gap = value.slice(previous.end, offset);
      const before = previous.token;

      previous = { end: offset + token.length, token };
      if (
        token === '\\verb' ||
        (TEXT_MODE_COMMAND.test(token) &&
          !/^\s*\{/.test(value.slice(offset + token.length)))
      ) {
        writable = false;
      }
      if (token === '{') {
        // An unbraced argument can sit between a command and its braced one,
        // as in `\frac a{b}` or `\sqrt[3]{x}`, and a sub- or superscript group
        // is no command's argument.
        const script = /[_^]\s*$/.test(gap);
        const carried = !script && before === '}' && !gap.trim();
        const owner = script
          ? undefined
          : /^\\[A-Za-z]+$/.test(before)
            ? before
            : carried
              ? closedOwner
              : undefined;

        groups.push({ mode: groupMode(mode, owner, carried), owner });

        return token;
      }
      if (token === '}') {
        closedOwner = groups.pop()?.owner;

        return token;
      }
      if (token === '$' || token === '\\(' || token === '\\)') {
        if (mode === 'nested-math') groups.pop();
        else if (mode === 'text') groups.push({ mode: 'nested-math' });

        return token;
      }
      if (token === '|' || token === '\\|') {
        // `\char` reads the character after a backtick as its code, which a
        // rewrite would change.
        const operand = value[offset - 1] === '`';

        if (!operand && (mode === 'math' || mode === 'nested-math')) {
          return token === '|' ? '\\vert ' : '\\Vert ';
        }
        if (!operand && mode === 'text' && token === '|') return '\\textbar{}';
        writable = false;

        return token;
      }
      if (delimiter === undefined) return token;
      if (body.includes('|')) writable = false;
      if (delimiter !== '|') return token;

      const free = VERB_DELIMITERS.find((char) => !body.includes(char));

      if (!free) {
        writable = false;

        return token;
      }

      return `${token.slice(0, token.indexOf('|'))}${free}${body}${free}`;
    }
  );

  return writable ? escaped : null;
};

const reportDestination = (line: LineWriter) =>
  reportReplaced(line, '"|" in a link destination became "%7C".', 'link');

const endsLine = (node: PhrasingContent | undefined) =>
  node?.type === 'break' ||
  (node?.type === 'html' && node.value === TRAILING_BREAK_HTML);

/**
 * `beforeBreak` means the last child ends right before a line break.
 * `encodeMarkdownParagraph` splits a `\r\n` at the `\n`, so text before a
 * break can still end with the `\r`.
 */
const lowerPhrasing = (
  children: readonly PhrasingContent[],
  line: LineWriter,
  beforeBreak = false
): PhrasingContent[] =>
  children.flatMap((child, childIndex): PhrasingContent[] => {
    const endsBeforeBreak =
      childIndex === children.length - 1
        ? beforeBreak
        : endsLine(children[childIndex + 1]);

    switch (child.type) {
      case 'break': {
        return [html('<br/>')];
      }
      case 'text':
      case 'inlineCode': {
        const value = endsBeforeBreak
          ? child.value.replace(/\r$/, '')
          : child.value;

        if (!value) return [];
        // mdast-util-gfm-table escapes `|` in code but not a backslash before
        // it, so `\|` would end the cell; as text it keeps every character.
        const asText = child.type === 'inlineCode' && value.includes('\\|');

        if (asText) {
          reportReplaced(
            line,
            'inline code holding "\\|" became text.',
            'inlineCode'
          );
        }

        const node = asText
          ? { type: 'text' as const, value }
          : { ...child, value };

        if (!LINE_ENDING.test(value)) return [node];

        return value
          .split(LINE_ENDING)
          .flatMap((part, index): PhrasingContent[] => [
            ...(index > 0 ? [html('<br/>')] : []),
            ...(part ? [{ ...node, value: part }] : []),
          ]);
      }
      case 'inlineMath': {
        let { value } = child;

        if (LINE_ENDING.test(value)) {
          value = value.replace(LINE_ENDINGS, ' ');
          reportReplaced(
            line,
            'line endings in inline math became spaces.',
            'inlineMath'
          );
        }
        if (!value.includes('|')) return [{ ...child, value }];

        const escaped = escapeTexPipes(value);

        if (escaped === null) {
          reportReplaced(
            line,
            'inline math holding "|" became text.',
            'inlineMath'
          );

          return [{ type: 'text', value }];
        }
        reportReplaced(line, '"|" in inline math was rewritten.', 'inlineMath');

        return [{ ...child, value: escaped }];
      }
      case 'html': {
        if (child.value === TRAILING_BREAK_HTML) return [html('<br />')];

        const value = child.value.replace(LINE_ENDINGS, ' ');

        if (value !== child.value) {
          reportReplaced(
            line,
            'line endings in raw HTML became spaces.',
            'html'
          );
        }
        if (!value.includes('|')) return [{ ...child, value }];
        // The link mapping writes a bare autolink literal as raw HTML, where a
        // character reference would change the URL.
        if (URL_LITERAL.test(value)) {
          reportDestination(line);

          return [{ ...child, value: value.replaceAll('|', '%7C') }];
        }
        reportReplaced(line, '"|" in raw HTML became "&#124;".', 'html');

        return [{ ...child, value: value.replaceAll('|', '&#124;') }];
      }
      case 'link': {
        const label = lowerPhrasing(child.children, line, endsBeforeBreak);

        if (
          !child.url.includes('|') ||
          !writesAsAutolink(child, line.resourceLink)
        ) {
          return [{ ...child, children: label }];
        }
        reportDestination(line);

        return [
          { ...child, children: label, url: child.url.replaceAll('|', '%7C') },
        ];
      }
      case 'delete':
      case 'emphasis':
      case 'mdxJsxTextElement':
      case 'strong': {
        const content = lowerPhrasing(child.children, line, endsBeforeBreak);

        // A wrapper emptied by the `\r` strip would write bare markup.
        if (content.length === 0 && child.children.length > 0) return [];

        return [{ ...child, children: content }];
      }
      default: {
        return [child];
      }
    }
  });

const lowerList = (list: List, line: LineWriter): PhrasingContent[] => [
  html(
    list.ordered
      ? list.start != null && list.start !== 1
        ? `<ol start="${list.start}">`
        : '<ol>'
      : '<ul>'
  ),
  ...list.children.flatMap((item) =>
    lowerItem(item, list.ordered === true, line)
  ),
  html(list.ordered ? '</ol>' : '</ul>'),
];

const lowerItem = (
  item: ListItem,
  ordered: boolean,
  line: LineWriter
): PhrasingContent[] => [
  html('<li>'),
  ...(!ordered && typeof item.checked === 'boolean'
    ? [
        html(
          item.checked
            ? '<input type="checkbox" checked disabled /> '
            : '<input type="checkbox" disabled /> '
        ),
      ]
    : []),
  ...item.children.flatMap((child, index): PhrasingContent[] => {
    if (child.type === 'list') return lowerList(child, line);
    if (index === 0 && child.type === 'paragraph') {
      return lowerPhrasing(child.children, line);
    }
    line.report({
      action: 'dropped',
      message: `Markdown cannot write "${child.type}" inside a list on one line; it was omitted.`,
      nodeType: child.type,
    });

    return [];
  }),
  html('</li>'),
];

const lowerBlock = (block: MdRootContent, line: LineWriter): LineSegment[] => {
  const collapse = () =>
    line.report({
      action: 'unwrapped',
      kind: 'property',
      message: `Markdown writes this content on one line; a "${block.type}" lost its block formatting.`,
      nodeType: block.type,
    });

  switch (block.type) {
    case 'paragraph': {
      // The image mapping writes an image as a paragraph holding only it.
      const [only] = block.children;

      return [
        {
          kind:
            block.children.length === 1 && only.type === 'image'
              ? 'block'
              : 'text',
          phrasing: lowerPhrasing(block.children, line),
        },
      ];
    }
    case 'list': {
      return [{ kind: 'list', phrasing: lowerList(block, line) }];
    }
    case 'heading': {
      collapse();

      return [{ kind: 'text', phrasing: lowerPhrasing(block.children, line) }];
    }
    case 'blockquote': {
      collapse();

      return block.children.flatMap((child) => lowerBlock(child, line));
    }
    case 'code':
    case 'math': {
      collapse();

      return [
        {
          kind: 'text',
          phrasing: lowerPhrasing([{ type: 'text', value: block.value }], line),
        },
      ];
    }
    default: {
      if (isMdLineContent(block)) {
        // An image reads back as its own block, so joining it with `<br/>`
        // loses nothing.
        return [
          {
            kind: block.type === 'image' ? 'block' : 'text',
            phrasing: lowerPhrasing([block], line),
          },
        ];
      }
      line.report({
        action: 'dropped',
        message: `Markdown cannot write "${block.type}" on one line; it was omitted.`,
        nodeType: block.type,
      });

      return [];
    }
  }
};

/**
 * The Markdown runtime owns one-line syntax, so a mapping for a one-line
 * container, such as a GFM table cell, never spells lists or breaks itself.
 */
export const encodeMarkdownLine = (
  blocks: readonly MdRootContent[],
  report: MarkdownEncodeContext['report'],
  resourceLink: boolean
): PhrasingContent[] => {
  const reported = new Set<string>();
  const line: LineWriter = {
    report: (diagnostic) => {
      if (diagnostic.kind === 'property') {
        if (reported.has(diagnostic.message)) return;
        reported.add(diagnostic.message);
      }
      report(diagnostic);
    },
    resourceLink,
  };
  const segments = blocks.flatMap((block) => lowerBlock(block, line));

  return segments.flatMap((segment, index) => {
    const previous = segments[index - 1];

    if (!previous || previous.kind === 'list' || segment.kind === 'list') {
      return segment.phrasing;
    }
    if (previous.kind === 'block' || segment.kind === 'block') {
      return [html('<br/>'), ...segment.phrasing];
    }
    line.report({
      action: 'unwrapped',
      kind: 'property',
      message:
        'Markdown writes this content on one line; block boundaries became <br/>.',
      nodeType: 'paragraph',
    });

    return [html('<br/>'), ...segment.phrasing];
  });
};

type ListToken =
  | Readonly<{ checked: boolean; kind: 'checkbox' }>
  | Readonly<{ kind: 'close'; ordered: boolean }>
  | Readonly<{ kind: 'item-close' }>
  | Readonly<{ kind: 'item-open' }>
  | Readonly<{ kind: 'open'; ordered: boolean; start?: number }>;

const TAG =
  /^<(\/?)([a-z]+)((?:\s+[a-z-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>$/i;
const ATTRIBUTE =
  /([a-z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;

const readListToken = (node: PhrasingContent | undefined): ListToken | null => {
  const match = node?.type === 'html' ? TAG.exec(node.value.trim()) : null;

  if (!match) return null;

  const [, closing, rawName, rawAttributes] = match;
  const name = rawName.toLowerCase();
  const attributes = new Map<string, string | true>();

  for (const [, key, double, single, bare] of rawAttributes.matchAll(
    ATTRIBUTE
  )) {
    const attribute = key.toLowerCase();

    if (attributes.has(attribute)) return null;
    attributes.set(attribute, double ?? single ?? bare ?? true);
  }
  if (closing) {
    if (attributes.size > 0) return null;
    if (name === 'li') return { kind: 'item-close' };

    return name === 'ul' || name === 'ol'
      ? { kind: 'close', ordered: name === 'ol' }
      : null;
  }
  if (name === 'ul' || name === 'li') {
    if (attributes.size > 0) return null;

    return name === 'ul'
      ? { kind: 'open', ordered: false }
      : { kind: 'item-open' };
  }
  if (name === 'ol') {
    const start = attributes.get('start');

    if (attributes.size > (start === undefined ? 0 : 1)) return null;
    if (start === undefined) return { kind: 'open', ordered: true };
    if (start === true || !/^-?\d+$/.test(start)) return null;

    const number = Number(start);

    return Number.isSafeInteger(number)
      ? { kind: 'open', ordered: true, start: number }
      : null;
  }
  if (name !== 'input') return null;

  const type = attributes.get('type');

  if (typeof type !== 'string' || type.toLowerCase() !== 'checkbox') {
    return null;
  }
  for (const [attribute, value] of attributes) {
    if (attribute === 'type') continue;
    if (attribute !== 'checked' && attribute !== 'disabled') return null;
    if (
      value !== true &&
      value !== '' &&
      value !== 'true' &&
      value.toLowerCase() !== attribute
    ) {
      return null;
    }
  }

  return { checked: attributes.has('checked'), kind: 'checkbox' };
};

const isBlank = (node: PhrasingContent | undefined) =>
  node?.type === 'text' && /^[ \t\r\n]*$/.test(node.value);

/**
 * Match every list tag of one line in a single pass, so malformed input stays
 * linear.
 */
const matchListTags = (tokens: ReadonlyArray<ListToken | null>) => {
  const close = new Map<number, number>();
  const listDepth = new Map<number, number>();
  const open: Array<{ deepest: number; index: number; ordered: boolean }> = [];

  tokens.forEach((token, index) => {
    if (token?.kind === 'open') {
      open.push({ deepest: 0, index, ordered: token.ordered });

      return;
    }
    if (token?.kind !== 'close') return;

    const run = open.pop();

    if (run?.ordered !== token.ordered) {
      open.length = 0;

      return;
    }

    const level = run.deepest + 1;
    const parent = open.at(-1);

    close.set(run.index, index);
    listDepth.set(run.index, level);
    if (parent) parent.deepest = Math.max(parent.deepest, level);
  });

  return { close, listDepth };
};

const createListReader = (
  nodes: readonly PhrasingContent[],
  tokens: ReadonlyArray<ListToken | null>,
  options: DeserializeMdContext
) => {
  const { close, listDepth } = matchListTags(tokens);

  const readItem = (
    start: number,
    allowsTask: boolean
  ): Readonly<{ end: number; item: ListItem }> | null => {
    let index = start + 1;
    let checked: boolean | null = null;
    const inline: PhrasingContent[] = [];
    const nested: List[] = [];
    const first = tokens[index];

    if (allowsTask && first?.kind === 'checkbox') {
      ({ checked } = first);
      index += 1;

      const text = nodes[index];

      // The writer puts one space between the checkbox and the item text.
      if (text?.type === 'text' && text.value.startsWith(' ')) {
        if (text.value.length > 1) {
          inline.push({ ...text, value: text.value.slice(1) });
        }
        index += 1;
      }
    }
    for (; index < nodes.length; index++) {
      const token = tokens[index];

      if (token?.kind === 'item-close') {
        // An item always starts with its own paragraph, which List builds as
        // the item's text; a nested list never stands in for it.
        const paragraph: Paragraph = { children: inline, type: 'paragraph' };

        return {
          end: index + 1,
          item: {
            checked,
            children: [paragraph, ...nested],
            spread: false,
            type: 'listItem',
          },
        };
      }
      if (token?.kind === 'open') {
        const list = readList(index);

        if (!list) return null;
        nested.push(list.list);
        index = list.end - 1;
        continue;
      }
      if (token) return null;
      if (nested.length > 0) {
        if (isBlank(nodes[index])) continue;

        return null;
      }
      inline.push(nodes[index]);
    }

    return null;
  };

  const readList = (
    start: number
  ): Readonly<{ end: number; list: List }> | null => {
    const end = close.get(start);
    const open = tokens[start];

    if (end === undefined || open?.kind !== 'open') return null;

    const items: ListItem[] = [];

    for (let index = start + 1; index < end; index++) {
      if (isBlank(nodes[index])) continue;
      if (tokens[index]?.kind !== 'item-open') return null;

      const item = readItem(index, !open.ordered);

      if (!item || item.end > end) return null;
      items.push(item.item);
      index = item.end - 1;
    }
    if (items.length === 0) return null;

    return {
      end: end + 1,
      list: {
        children: items,
        ordered: open.ordered,
        spread: false,
        start: open.ordered ? (open.start ?? 1) : null,
        type: 'list',
      },
    };
  };

  return {
    close,
    read: (start: number) => {
      const level = listDepth.get(start);

      if (level === undefined) return null;
      // Below the line, each list level adds a list item and a paragraph,
      // and the paragraph's text sits one deeper.
      if (2 * level + 1 > options.limits.maxDepth) {
        options.report({
          actual: 2 * level + 1,
          code: 'markdown-limit-exceeded',
          limit: 'maxDepth',
          maximum: options.limits.maxDepth,
          message: `Markdown syntax depth exceeds ${options.limits.maxDepth}.`,
          severity: 'error',
        });

        throw new ReportedMarkdownFailureError();
      }

      return readList(start);
    },
  };
};

const isBlockElement = (
  node: Descendant | undefined,
  options: DeserializeMdContext
) =>
  ElementApi.isElement(node) &&
  options.isBlock(node) &&
  !options.isInline(node);

/** Drop the `<br/>` the writer puts between a block element and its neighbors. */
const withoutSeparatorBreaks = (
  children: readonly Descendant[],
  options: DeserializeMdContext
) =>
  children.filter(
    (child, index) =>
      !(
        TextApi.isText(child) &&
        child.text === '\n' &&
        (isBlockElement(children[index - 1], options) ||
          isBlockElement(children[index + 1], options))
      )
  );

/**
 * A list run goes to the installed list decoders as a standard mdast list and
 * is never placed in the tree, so no mapping or remark plugin sees a list
 * inside a table cell.
 */
export const decodeMarkdownLine = (
  nodes: readonly PhrasingContent[],
  marks: MdMarks,
  options: DeserializeMdContext
): Descendant[] => {
  const listDecoders = getMarkdownDecoders(options.mappings, { type: 'list' });
  const blocks: Descendant[] = [];
  let previous: MdRootContent | null = null;
  let segmentStart = 0;

  const flushSegment = (end: number) => {
    const segment = nodes.slice(segmentStart, end);

    if (segment.every(isBlank)) return;

    const decoded = withoutSeparatorBreaks(
      convertNodesDeserialize(segment, marks, options).map(
        readEmptyParagraphMarker
      ),
      options
    );

    if (decoded.length === 0) return;
    blocks.push(...toMarkdownBlockContent(options, decoded));
  };

  if (listDecoders) {
    const tokens = nodes.map(readListToken);
    const reader = createListReader(nodes, tokens, options);
    let lastText = -1;

    for (let index = 0; index < nodes.length; index++) {
      if (tokens[index]?.kind !== 'open') {
        if (!isBlank(nodes[index])) lastText = index;
        continue;
      }

      const parsed = reader.read(index);
      const decoded =
        parsed &&
        runMarkdownDecoders(
          listDecoders,
          parsed.list,
          marks,
          options,
          // The run's previous sibling is the last phrasing node before it,
          // or the list run that came before.
          lastText >= segmentStart ? nodes[lastText] : previous
        );

      if (parsed && decoded) {
        flushSegment(index);
        blocks.push(...decoded);
        previous = parsed.list;
        segmentStart = parsed.end;
        index = parsed.end - 1;
        continue;
      }

      // A run that does not read as a list stays literal as a whole.
      const end = parsed?.end ?? (reader.close.get(index) ?? index) + 1;

      lastText = end - 1;
      index = end - 1;
    }
  }
  flushSegment(nodes.length);

  return blocks;
};
