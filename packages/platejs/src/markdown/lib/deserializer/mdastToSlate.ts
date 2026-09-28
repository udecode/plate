import type { Root } from 'mdast';

import type { Descendant } from '../../../core';
import type { DeserializeMdContext } from '../types';
import { convertNodesDeserialize } from './convertNodesDeserialize';

export const mdastToSlate = (
  root: Root,
  options: DeserializeMdContext
): Descendant[] => {
  root.children = root.children.map((child) => {
    if (child.type === 'html' && /^<br\s*\/?>$/i.test(child.value)) {
      return {
        children: [{ type: 'text', value: '\n' }],
        type: 'paragraph',
      };
    }
    return child;
  });

  return convertNodesDeserialize(root.children, {}, options);
};
