import type { Root } from 'mdast';

import { type Descendant, getPluginKey, KEYS } from 'platejs';

import type { MdRoot } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const mdastToSlate = (
  node: Root,
  options: DeserializeMdOptions
): Descendant[] => {
  return buildSlateRoot(node, options);
};

const buildSlateRoot = (
  root: MdRoot,
  options: DeserializeMdOptions
): Descendant[] => {
  if (!options.splitLineBreaks) {
    root.children = root.children.map((child) => {
      if (child.type === 'html' && child.value === '<br />') {
        return {
          children: [{ type: 'text', value: '\n' }],
          type: 'paragraph',
        };
      }
      return child;
    });
    return convertNodesDeserialize(root.children, {}, options);
  }

  // Split line breaks into separate paragraphs
  const results: Descendant[] = [];
  let startLine = root.position?.start.line ?? 1;

  const addEmptyParagraphs = (count: number) => {
    if (count > 0) {
      results.push(
        ...Array.from({ length: count }).map(() => ({
          children: [{ text: '' }],
          type: options.editor
            ? (getPluginKey(options.editor, KEYS.p) ?? KEYS.p)
            : KEYS.p,
        }))
      );
    }
  };

  root.children?.forEach((child, index) => {
    const isFirstChild = index === 0;
    const isLastChild = index === root.children!.length - 1;

    if (child.position) {
      const emptyLinesBefore =
        child.position.start.line - (isFirstChild ? startLine : startLine + 1);
      addEmptyParagraphs(emptyLinesBefore);

      const transformValue = convertNodesDeserialize([child], {}, options);
      results.push(...transformValue);

      if (isLastChild) {
        const emptyLinesAfter =
          root.position!.end.line - child.position.end.line - 1;
        addEmptyParagraphs(emptyLinesAfter);
      }

      startLine = child.position.end.line;
    } else {
      const transformValue = convertNodesDeserialize([child], {}, options);
      results.push(...transformValue);
    }
  });

  return results;
};
