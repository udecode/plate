import type {
  Html,
  Nodes,
  Paragraph,
  Parent,
  Root,
  Text as MdText,
} from 'mdast';
import type { Processor, Plugin as UnifiedPlugin } from 'unified';
import type { Point } from 'unist';

import {
  type Descendant,
  type EditorCoreStateView,
  type Element,
  ElementApi,
  TextApi,
  PLUGINS,
} from '../../../core';
import { getMarkdownParagraphType } from '../../../internal/plugin/markdownParagraph';
import { isBareAutolinkLiteral } from '../../../internal/utils/urlPolicy';
import { convertChildrenDeserialize } from '../deserializer/convertChildrenDeserialize';
import type { MdRootContent } from '../mdast';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import type {
  DeserializeMdContext,
  MdMarks,
  SerializeMdContext,
} from '../types';
import { getMarkdownTagRepair } from './markdownTags';

const BR_TAG = /<br\s*\/?>/gi;
const ONLY_BR_TAGS = /^(?:\s*<br\s*\/?>)+\s*$/i;
// A run of whole comments, each closed by its own first `-->`, with only HTML
// whitespace between them, so no text or tag between two comments drops.
const HTML_COMMENT =
  /^[\t\n\f\r ]*(?:<!--(?!-?>)(?:(?!--!?>)[\s\S])*-->[\t\n\f\r ]*)+$/;
const TAG_NAME = /^<\/?([A-Za-z][\w-]*)/;

export const isMarkdownBreakHtml = (value: string) => ONLY_BR_TAGS.test(value);

/** Markdown drops an empty paragraph, so the writer gives it this text. */
const EMPTY_PARAGRAPH_TEXT = '\u200B';

/** The text an empty paragraph is written with, read back as empty. */
export const readEmptyParagraphMarker = (child: Descendant): Descendant =>
  TextApi.isText(child) && child.text === EMPTY_PARAGRAPH_TEXT
    ? { ...child, text: '' }
    : child;

const withoutLoneBreakSeparators = (
  children: Paragraph['children']
): Paragraph['children'] =>
  children.filter((child, index) => {
    const previous = children[index - 1];

    return !(
      child.type === 'html' &&
      child.value === WRITER_SEPARATOR &&
      previous?.type === 'html' &&
      previous.value === WRITTEN_BREAK_HTML
    );
  });

const withoutTrailingBreakMarkup = (
  children: Paragraph['children']
): Paragraph['children'] => {
  const last = children.at(-1);
  const previous = children.at(-2);

  if (last?.type !== 'html' || !ONLY_BR_TAGS.test(last.value) || !previous) {
    return children;
  }
  // After an image, the `<br>` would only open an empty paragraph, with or
  // without a line ending between them.
  if (previous.type === 'image') return children.slice(0, -1);
  if (
    previous.type === 'text' &&
    previous.value === '\n' &&
    children.at(-3)?.type === 'image'
  ) {
    return children.slice(0, -2);
  }
  // The writer keeps a trailing line break as a line ending plus `<br />`:
  // the line ending is not content, the `<br>` is.
  if (previous.type === 'text' && previous.value.endsWith('\n')) {
    return [
      ...children.slice(0, -2),
      { ...previous, value: previous.value.slice(0, -1) },
      last,
    ];
  }
  // After text ending in two spaces, that line ending reads as a hard break,
  // which the `<br>` repeats.
  if (previous.type === 'break') return [...children.slice(0, -2), last];
  return children;
};

const endsWithBr = (node: MdRootContent | null | undefined): boolean => {
  if (node && 'children' in node && node.children.length > 0) {
    return endsWithBr(node.children.at(-1));
  }

  return node?.type === 'html' && ONLY_BR_TAGS.test(node.value);
};

const dropLineEndingAfterBr = (
  value: string,
  previousSibling: MdRootContent | null
) =>
  endsWithBr(previousSibling) && value.startsWith('\n')
    ? value.slice(1)
    : value;

const withUnmarkedLineEndings = (text: string, marks: MdMarks) =>
  text.includes('\n')
    ? text
        .split(/(\n)/)
        .filter(Boolean)
        .map((part) =>
          part === '\n' ? { text: part } : { ...marks, text: part }
        )
    : { ...marks, text };

// Flow containers whose direct `html` children decode as their own paragraph
// instead of merging into neighboring text.
const FLOW_CONTAINERS: ReadonlySet<string> = new Set([
  'blockquote',
  'list',
  'listItem',
]);
// The writer prints it between two blocks its join keeps apart.
const WRITER_SEPARATOR = '<!---->';

const isBlockWrapper = (node: Readonly<{ name?: unknown; type: string }>) =>
  node.type === 'mdxJsxFlowElement' && node.name === 'block';

export const findMarkdownFlowHtmlBlocks = (tree: Root): Set<Html> => {
  const blocks = new Set<Html>();
  const visit = (parent: MdParent, split: boolean) => {
    for (const child of parent.children) {
      if (child.type === 'html') {
        if (split) blocks.add(child);
      } else if (isBlockWrapper(child)) {
        visit(child as MdParent, split);
      } else if ('children' in child) {
        visit(child, split && FLOW_CONTAINERS.has(child.type));
      }
    }
  };

  visit(tree, true);

  return blocks;
};

/**
 * Language-level decoders every editor needs, even without feature plugins.
 * They run after every feature mapping on the same MDAST kind has declined.
 */
export const markdownIntrinsicDecoders = {
  break: () => ({ text: '\n' }),
  // Under CommonMark, raw HTML is ordinary input: account for it.
  html: (node: Html, marks: MdMarks, options: DeserializeMdContext) => {
    const value = node.value || '';
    const repair = getMarkdownTagRepair(node);

    if (repair) {
      if (repair.reported) {
        options.report({
          code: 'markdown-tag-repair',
          message: `Markdown tag ${value} is ${repair.repair} and was kept as text.`,
          reason: repair.repair,
          severity: 'warning',
          source: options.sourceLocation(node),
          tag: TAG_NAME.exec(value)?.[1] ?? value,
        });
      }

      return { ...marks, text: value };
    }
    if (ONLY_BR_TAGS.test(value)) {
      return { text: value.replace(BR_TAG, '\n') };
    }
    if (HTML_COMMENT.test(value)) {
      options.report({
        action: 'dropped',
        code: 'markdown-unsupported-node',
        impact: 'lossless',
        message: 'Markdown HTML comment was omitted.',
        nodeType: 'html',
        owner: 'markdown',
        phase: 'parse',
        severity: 'warning',
        source: options.sourceLocation(node),
      });

      return [];
    }
    // The dialect reads raw HTML as text, so every character is kept.
    options.report({
      action: 'replaced',
      code: 'markdown-unsupported-node',
      impact: 'lossless',
      message:
        'Markdown raw HTML has no installed mapping and was kept as text.',
      nodeType: 'html',
      owner: 'markdown',
      phase: 'parse',
      severity: 'warning',
      source: options.sourceLocation(node),
    });

    const text = { ...marks, text: value };

    return options.flowHtmlBlocks?.has(node)
      ? { children: [text], type: getMarkdownParagraphType(options.registry) }
      : text;
  },
  paragraph: (
    node: Paragraph,
    marks: MdMarks,
    options: DeserializeMdContext
  ) => {
    const paragraphType = getMarkdownParagraphType(options.registry);
    const imageType = options.registry.type(PLUGINS.image);
    const children = convertChildrenDeserialize(
      withoutTrailingBreakMarkup(withoutLoneBreakSeparators(node.children)),
      marks,
      options
    ).map(readEmptyParagraphMarker);
    const elements: Descendant[] = [];
    let inlineNodes: Descendant[] = [];
    const flushInlineNodes = () => {
      if (inlineNodes.length === 0) return;

      elements.push({ children: inlineNodes, type: paragraphType });
      inlineNodes = [];
    };

    children.forEach((child) => {
      if (
        imageType !== undefined &&
        (child as { type?: string }).type === imageType
      ) {
        flushInlineNodes();
        elements.push(child);
      } else {
        inlineNodes.push(child);
      }
    });

    flushInlineNodes();

    return elements.length === 1 ? elements[0] : elements;
  },
  text: (
    node: MdText,
    marks: MdMarks,
    _options: DeserializeMdContext,
    previousSibling: MdRootContent | null
  ) =>
    withUnmarkedLineEndings(
      dropLineEndingAfterBr(node.value, previousSibling),
      marks
    ),
};

export const getMarkdownParagraphLanding = (
  schema: EditorCoreStateView['schema'],
  index: number
): Element | null => {
  const block = schema.createDefaultChild({ at: [index] });

  if (!ElementApi.isElement(block)) return null;

  const facts = schema.element(block.type);

  return facts?.content?.allowsText && !facts.behavior.void ? block : null;
};

const ENDS_BARE_URL = /^[?!.,:)*_~]*(?:[\s<]|$)/;
const ONLY_TRIMMED = /^[?!.,:)*_~]*$/;
const TRIMMED_FROM_BARE_URL = /[?!.,:*_~"';\]]$/;
const JOINS_URL = 'x';
const ENDS_INSIDE_LINE = new Set(['delete', 'emphasis', 'link', 'strong']);

const writtenStart = (node: Nodes): string => {
  switch (node.type) {
    case 'break': {
      return '\\\n';
    }
    case 'delete':
    case 'emphasis':
    case 'strong': {
      return `*${node.children.map(writtenStart).join('')}*`;
    }
    case 'html': {
      return node.value;
    }
    case 'text': {
      // The writer may put a backslash escape before each of these.
      return node.value.replaceAll(/[*_~<]/g, '\\');
    }
    default: {
      return node.type.startsWith('mdxJsx') ? '<' : JOINS_URL;
    }
  }
};

type MdParent = { children: Parent['children']; type: string };

const writtenEnd = (node: Nodes): string => {
  switch (node.type) {
    case 'break': {
      return '\n';
    }
    case 'delete': {
      return '~';
    }
    case 'emphasis':
    case 'strong': {
      return '*';
    }
    case 'html':
    case 'text': {
      return node.value;
    }
    default: {
      return JOINS_URL;
    }
  }
};

// micromark-extension-gfm-autolink-literal links a bare scheme URL unless an
// ASCII letter comes right before it (previousProtocol in lib/syntax.js).
const ENDS_IN_LETTER = /[a-z]$/i;

const writtenBefore = (parent: MdParent, index: number) => {
  for (let previous = index - 1; previous >= 0; previous -= 1) {
    const written = writtenEnd(parent.children[previous]);

    if (written) return written;
  }

  return parent.type === 'link' || parent.type.startsWith('mdxJsx')
    ? JOINS_URL
    : '';
};

const writtenAfter = (parent: MdParent, index: number) => {
  let written = '';

  for (let next = index + 1; next < parent.children.length; next += 1) {
    written += writtenStart(parent.children[next]);
    if (!ONLY_TRIMMED.test(written)) return written;
  }

  return ENDS_INSIDE_LINE.has(parent.type) ? written + JOINS_URL : written;
};

const count = (text: string, character: string) =>
  text.split(character).length - 1;

// GFM links a bare URL only when its domain holds a character other than `.`
// and `_`, and its last two domain segments hold no `_`.
const GFM_DOMAIN = /^https?:\/\/((?:[-._]|[^\s\p{P}\p{S}])*)/iu;

const staysBare = (url: string, after: string) => {
  const end = ENDS_BARE_URL.exec(after)?.[0];
  const domain = GFM_DOMAIN.exec(url)?.[1] ?? '';

  if (
    end === undefined ||
    TRIMMED_FROM_BARE_URL.test(url) ||
    !/[^._]/.test(domain) ||
    domain
      .split('.')
      .slice(-2)
      .some((segment) => segment.includes('_'))
  ) {
    return false;
  }

  const opened = count(url, '(') - count(url, ')');

  if (opened < 0 || (opened > 0 && end.includes(')'))) return false;

  // mdast-util-gfm-autolink-literal escapes a `.` after `w` before `.` or a
  // word character.
  return !(/w$/i.test(url) && /^\.[-.\w]/.test(end));
};

export const writeBareUrlsSafely = (parent: MdParent) => {
  parent.children.forEach((child, index) => {
    if ('children' in child) {
      writeBareUrlsSafely(child);
      return;
    }
    if (
      child.type !== 'html' ||
      !isBareAutolinkLiteral(child.value) ||
      (!ENDS_IN_LETTER.test(writtenBefore(parent, index)) &&
        staysBare(child.value, writtenAfter(parent, index)))
    ) {
      return;
    }

    parent.children[index] = {
      children: [{ type: 'text', value: child.value }],
      type: 'link',
      url: child.value,
    };
  });
};

const escapedTexts = new WeakSet<MdText>();

const pushText = (
  stack: Nodes[],
  token: { start: Point },
  markEscaped: boolean
) => {
  const { column, line, offset } = token.start;
  const node: MdText = {
    position: {
      end: { column, line, offset },
      start: { column, line, offset },
    },
    type: 'text',
    value: '',
  };

  if (markEscaped) escapedTexts.add(node);
  (stack.at(-1) as Parent).children.push(node);
  stack.push(node);
};

const startEscapedText = function (
  this: { stack: Nodes[] },
  token: { start: Point }
) {
  pushText(this.stack, token, true);
};

const startDataAfterEscape = function (
  this: { stack: Nodes[] },
  token: { start: Point }
) {
  const parent = this.stack.at(-1) as Parent;
  const tail = parent.children.at(-1);

  if (tail?.type === 'text' && !escapedTexts.has(tail)) {
    this.stack.push(tail);

    return;
  }
  pushText(this.stack, token, false);
};

const joinTexts = (parent: MdParent) => {
  const children: Parent['children'] = [];

  for (const child of parent.children) {
    const last = children.at(-1);

    if (last?.type === 'text' && child.type === 'text') {
      last.value += child.value;
      last.position =
        last.position && child.position
          ? { end: child.position.end, start: last.position.start }
          : undefined;
      continue;
    }
    if ('children' in child) joinTexts(child);
    children.push(child);
  }
  parent.children = children;
};

/**
 * Remark plugin that starts a text node at each backslash escape and
 * character reference while the source parses. Paired with
 * `remarkJoinEscapedTexts` after remark plugins so autolinks and emoji
 * shortcodes never match across an escaped character.
 */
export const remarkSeparateEscapes: UnifiedPlugin<[], Root> = function (
  this: Processor
) {
  const data = this.data() as { fromMarkdownExtensions?: unknown[] };

  (data.fromMarkdownExtensions ??= []).push({
    enter: {
      characterEscape: startEscapedText,
      characterReference: startEscapedText,
      data: startDataAfterEscape,
    },
  });
};

export const remarkJoinEscapedTexts: UnifiedPlugin<[], Root> =
  () => (tree, file) => {
    if (/[&\\]/.test(String(file.value))) joinTexts(tree);
  };

export const TRAILING_BREAK_HTML = '\n<br />';

const WRITTEN_BREAK_HTML = '<br />';

/**
 * The first break of a paragraph that holds only hard breaks. `<br />` alone
 * on a paragraph's first line opens an HTML block, which reads back as an
 * empty paragraph; the comment after it keeps the line a paragraph and drops
 * on import.
 */
export const LONE_BREAK_HTML = `${WRITTEN_BREAK_HTML}${WRITER_SEPARATOR}`;

/**
 * Encode the paragraph type when no feature mapping claims it. Newlines in text
 * become hard breaks; a trailing one is kept as `<br />` because Markdown drops
 * a hard break at the end of a paragraph.
 */
export const encodeMarkdownParagraph = (
  node: Element,
  options: SerializeMdContext
): Paragraph => {
  const [only] = node.children;
  const placeholder =
    node.children.length === 1 &&
    TextApi.isText(only) &&
    only.text === '' &&
    options.preserveEmptyParagraphs !== false
      ? {
          ...only,
          text: EMPTY_PARAGRAPH_TEXT,
        }
      : undefined;
  const children = convertNodesSerialize(
    placeholder ? [placeholder] : node.children,
    placeholder
      ? {
          ...options,
          modelLocation: (child) =>
            options.modelLocation(child === placeholder ? only : child),
        }
      : options,
    { hardBreaks: true }
  );

  if (children.at(-1)?.type === 'break') {
    let index = children.length - 2;

    for (; index >= 0 && children[index].type === 'break'; index -= 1) {
      children[index] = { type: 'html', value: WRITTEN_BREAK_HTML };
    }
    children[children.length - 1] = {
      type: 'html',
      value: TRAILING_BREAK_HTML,
    };
    if (index < 0) children[0] = { type: 'html', value: LONE_BREAK_HTML };
  }

  return { children: children as Paragraph['children'], type: 'paragraph' };
};
