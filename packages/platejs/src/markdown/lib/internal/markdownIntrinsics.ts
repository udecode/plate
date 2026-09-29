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
const HTML_COMMENT = /^\s*<!--[\s\S]*-->\s*$/;
const TAG_NAME = /^<\/?([A-Za-z][\w-]*)/;

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
      node.children,
      marks,
      options
    ).map((child) =>
      TextApi.isText(child) && child.text === '\u200B'
        ? { ...child, text: '' }
        : child
    );
    const elements: Descendant[] = [];
    let inlineNodes: Descendant[] = [];
    const flushInlineNodes = () => {
      if (inlineNodes.length === 0) return;

      elements.push({ children: inlineNodes, type: paragraphType });
      inlineNodes = [];
    };

    children.forEach((child, index, allChildren) => {
      if ((child as { type?: string }).type === imageType) {
        flushInlineNodes();
        elements.push(child);
      } else if (
        child.text === '\n' &&
        allChildren.length > 1 &&
        index === allChildren.length - 1
      ) {
        // A trailing break does not create another paragraph.
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
            ? part(child, '\u200B')
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
    children[children.length - 1] = { type: 'html', value: '\n<br />' };
  }

  return { children: children as Paragraph['children'], type: 'paragraph' };
};
