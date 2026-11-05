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
const HTML_COMMENT = /^\s*<!--[\s\S]*-->\s*$/;
const TAG_NAME = /^<\/?([A-Za-z][\w-]*)/;

export const BARE_URL_HTML = /^[a-z][a-z\d+.-]*:\S*$/i;

/** Markdown drops an empty paragraph, so the writer gives it this text. */
const EMPTY_PARAGRAPH_TEXT = '\u200B';

/** The text an empty paragraph is written with, read back as empty. */
export const readEmptyParagraphMarker = (child: Descendant): Descendant =>
  TextApi.isText(child) && child.text === EMPTY_PARAGRAPH_TEXT
    ? { ...child, text: '' }
    : child;

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

    return { ...marks, text: value };
  },
  paragraph: (
    node: Paragraph,
    marks: MdMarks,
    options: DeserializeMdContext
  ) => {
    const paragraphType = getMarkdownParagraphType(options.registry);
    const imageType = options.registry.type(PLUGINS.image);
    const children = convertChildrenDeserialize(
      withoutTrailingBreakMarkup(node.children),
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

const staysBare = (url: string, after: string) => {
  const end = ENDS_BARE_URL.exec(after)?.[0];

  if (end === undefined || TRIMMED_FROM_BARE_URL.test(url)) return false;

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
      !BARE_URL_HTML.test(child.value) ||
      staysBare(child.value, writtenAfter(parent, index))
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

const startText = function (this: { stack: Nodes[] }, token: { start: Point }) {
  const { column, line, offset } = token.start;
  const node: MdText = {
    position: {
      end: { column, line, offset },
      start: { column, line, offset },
    },
    type: 'text',
    value: '',
  };

  (this.stack.at(-1) as Parent).children.push(node);
  this.stack.push(node);
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
 * character reference while the source parses, then joins the texts again.
 * mdast-util-gfm-autolink-literal links a URL it finds in decoded text during
 * the parse, so without the split the `https\://a.b` that the writer gives a
 * text URL reads back as a link.
 */
export const remarkSeparateEscapes: UnifiedPlugin<[], Root> = function (
  this: Processor
) {
  const data = this.data() as { fromMarkdownExtensions?: unknown[] };

  (data.fromMarkdownExtensions ??= []).push({
    enter: { characterEscape: startText, characterReference: startText },
  });

  return (tree, file) => {
    if (/[&\\]/.test(String(file.value))) joinTexts(tree);
  };
};

/** The `<br />` that keeps a paragraph's trailing line break, after its line ending. */
export const TRAILING_BREAK_HTML = '\n<br />';

/**
 * Encode the paragraph type when no feature mapping claims it. Newlines in text
 * become hard breaks; a trailing one is kept as `<br />` because Markdown drops
 * a hard break at the end of a paragraph.
 */
export const encodeMarkdownParagraph = (
  node: Element,
  options: SerializeMdContext
): Paragraph => {
  const lines: Descendant[][] = [[]];
  // Split leaves report diagnostics at the leaf they came from.
  const origins = new WeakMap<Descendant, Descendant>();
  const part = (child: Descendant, text: string) => {
    const copy = { ...child, text };

    origins.set(copy, child);

    return copy;
  };
  const isEmpty =
    node.children.length === 1 &&
    TextApi.isText(node.children[0]) &&
    node.children[0].text === '';

  for (const child of node.children) {
    if (!TextApi.isText(child) || !child.text.includes('\n')) {
      lines
        .at(-1)
        ?.push(
          isEmpty && options.preserveEmptyParagraphs !== false
            ? part(child, EMPTY_PARAGRAPH_TEXT)
            : child
        );
      continue;
    }
    child.text.split(/\r?\n/).forEach((text, index) => {
      if (index > 0) lines.push([]);
      if (text) lines.at(-1)?.push(part(child, text));
    });
  }

  const lineOptions: SerializeMdContext = {
    ...options,
    modelLocation: (child) =>
      options.modelLocation(origins.get(child) ?? child),
  };
  const children = lines.flatMap((line, index): MdRootContent[] => {
    const nodes = convertNodesSerialize(line, lineOptions);

    return [...(index > 0 ? [{ type: 'break' } as const] : []), ...nodes];
  });

  if (lines.length > 1 && lines.at(-1)?.length === 0) {
    for (let index = children.length - 2; index >= 0; index -= 1) {
      if (children[index].type !== 'break') break;
      children[index] = { type: 'html', value: '<br />' };
    }
    children[children.length - 1] = {
      type: 'html',
      value: TRAILING_BREAK_HTML,
    };
  }

  return { children: children as Paragraph['children'], type: 'paragraph' };
};
