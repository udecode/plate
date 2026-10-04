import type { Html, Paragraph, Text as MdText } from 'mdast';

import { type Descendant, type Element, TextApi, PLUGINS } from '../../../core';
import { convertChildrenDeserialize } from '../deserializer/convertChildrenDeserialize';
import type { MdRootContent } from '../mdast';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import type {
  DeserializeMdContext,
  MdMarks,
  SerializeMdContext,
} from '../types';
import { getMarkdownTagRepair } from './markdownTags';

const LEADING_NEWLINE_REGEX = /^\n/;
const BR_TAG = /<br\s*\/?>/gi;
const ONLY_BR_TAGS = /^(?:\s*<br\s*\/?>)+\s*$/i;
const LINE_ENDING_AT_END = /\r?\n$/;
const HTML_COMMENT = /^\s*<!--[\s\S]*-->\s*$/;
const TAG_NAME = /^<\/?([A-Za-z][\w-]*)/;

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
    /^\r?\n$/.test(previous.value) &&
    children.at(-3)?.type === 'image'
  ) {
    return children.slice(0, -2);
  }
  // The writer keeps a trailing line break as a line ending plus `<br />`:
  // the line ending is not content, the `<br>` is.
  if (previous.type === 'text' && LINE_ENDING_AT_END.test(previous.value)) {
    return [
      ...children.slice(0, -2),
      { ...previous, value: previous.value.replace(LINE_ENDING_AT_END, '') },
      last,
    ];
  }
  // After text ending in two spaces, that line ending reads as a hard break,
  // which the `<br>` repeats.
  if (previous.type === 'break') return [...children.slice(0, -2), last];
  return children;
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

    return { ...marks, text: value };
  },
  paragraph: (
    node: Paragraph,
    marks: MdMarks,
    options: DeserializeMdContext
  ) => {
    const paragraphType =
      options.registry.type(PLUGINS.paragraph) ?? 'paragraph';
    const imageType = options.registry.type(PLUGINS.image) ?? 'image';
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
      if ((child as { type?: string }).type === imageType) {
        flushInlineNodes();
        elements.push(child);
      } else {
        inlineNodes.push(child);
      }
    });

    flushInlineNodes();

    return elements.length === 1 ? elements[0] : elements;
  },
  text: (node: MdText, marks: MdMarks) => ({
    ...marks,
    text: node.value.replace(LEADING_NEWLINE_REGEX, ''),
  }),
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
    child.text.split('\n').forEach((text, index) => {
      if (index > 0) lines.push([]);
      if (text) lines.at(-1)?.push(part(child, text));
    });
  }

  const lineOptions: SerializeMdContext = {
    ...options,
    modelLocation: (child) =>
      options.modelLocation(origins.get(child) ?? child),
  };
  const children = lines.flatMap((line, index): MdRootContent[] => [
    ...(index > 0 ? [{ type: 'break' } as const] : []),
    ...convertNodesSerialize(line, lineOptions),
  ]);

  if (lines.length > 1 && lines.at(-1)?.length === 0) {
    children[children.length - 1] = {
      type: 'html',
      value: TRAILING_BREAK_HTML,
    };
  }

  return { children: children as Paragraph['children'], type: 'paragraph' };
};
