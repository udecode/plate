import { type Descendant, TextApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { convertChildrenDeserialize } from '../deserializer';
import type { MdParagraph } from '../mdast';
import { convertNodesSerialize } from '../serializer';
import type { MdRules } from '../types';

const LEADING_NEWLINE_REGEX = /^\n/;

const normalizeParagraphLineBreaks = (
  children: readonly Descendant[],
  options: { preserveEmptyParagraphs?: boolean }
) => {
  const isEmptyParagraph =
    children.length === 1 &&
    TextApi.isText(children[0]) &&
    children[0].text === '';

  return children.flatMap((child): Descendant[] => {
    const { text } = child as { text?: unknown };

    if (
      isEmptyParagraph &&
      text === '' &&
      options.preserveEmptyParagraphs !== false
    ) {
      return [{ ...child, text: '\u200B' }];
    }

    if (typeof text !== 'string' || !text.includes('\n')) {
      return [child];
    }

    return text.split('\n').flatMap((part, index, parts): Descendant[] => {
      const nodes: Descendant[] = [];

      if (part) nodes.push({ ...child, text: part });
      if (index < parts.length - 1) {
        nodes.push({ type: 'break' } as Descendant);
      }

      return nodes;
    });
  });
};

/** Language-level rules required even when no feature plugin is installed. */
export const intrinsicRules = {
  br: {
    deserialize: () => [{ text: '\n' }],
  },
  break: {
    deserialize: () => ({ text: '\n' }),
    serialize: () => ({ type: 'break' }),
  },
  html: {
    deserialize: (node) => ({
      text: (node.value || '').replaceAll('<br />', '\n'),
    }),
  },
  paragraph: {
    deserialize: (node, decoration, options) => {
      const paragraphType =
        options.registry.type(PLUGINS.paragraph) ?? 'paragraph';
      const children = convertChildrenDeserialize(
        node.children,
        decoration,
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

        elements.push({
          children: inlineNodes,
          type: paragraphType,
        });
        inlineNodes = [];
      };

      children.forEach((child, index, allChildren) => {
        const { type } = child as { type?: string };

        if (type === (options.registry.type(PLUGINS.image) ?? 'image')) {
          flushInlineNodes();
          elements.push(child);
        } else if (
          options.splitLineBreaks &&
          'text' in child &&
          typeof child.text === 'string'
        ) {
          const textParts = child.text.split('\n');

          if (child.text === '\n' && inlineNodes.length === 0) {
            inlineNodes.push({ ...child, text: '' });
            flushInlineNodes();

            return;
          }

          textParts.forEach((part, partIndex) => {
            if (partIndex > 0) flushInlineNodes();
            if (part) inlineNodes.push({ ...child, text: part });
            if (partIndex < textParts.length - 1) flushInlineNodes();
          });
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
    serialize: (node, options) => {
      const enrichedChildren = normalizeParagraphLineBreaks(
        node.children,
        options
      );
      const convertedNodes = convertNodesSerialize(
        enrichedChildren,
        options
      ) as MdParagraph['children'];

      if (convertedNodes.at(-1) && enrichedChildren.at(-1)?.type === 'break') {
        convertedNodes[convertedNodes.length - 1] = {
          type: 'html',
          value: '\n<br />',
        };
      }

      return {
        children: convertedNodes,
        type: 'paragraph',
      };
    },
  },
  text: {
    deserialize: (node, decoration) => ({
      ...decoration,
      text: node.value.replace(LEADING_NEWLINE_REGEX, ''),
    }),
  },
} satisfies MdRules;
