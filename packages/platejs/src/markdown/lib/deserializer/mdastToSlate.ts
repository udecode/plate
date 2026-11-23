import type { Root } from 'mdast';

import type { Descendant } from '../../../core';
import type { DeserializeMdContext } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

export const mdastToSlate = (
  root: Root,
  options: DeserializeMdContext
): Descendant[] => {
  root.children = root.children.map((child) => {
    if (child.type === 'html' && /^<br\s*\/?>$/i.test(child.value)) {
      return {
        children: [{ type: 'text', value: '' }],
        position: child.position,
        type: 'paragraph',
      };
    }
    return child;
  });

  options.onRootChildren?.(root.children);
  const marks = {};
  const nodes: Descendant[] = [];
  const counts: number[] = [];

  root.children.forEach((child, index) => {
    const converted = buildSlateNode(
      child,
      marks,
      options,
      index === 0
        ? (options.previousRootSibling ?? null)
        : root.children[index - 1]
    );

    counts.push(converted.length);
    for (const node of converted) nodes.push(node);
  });
  options.onRootBlocks?.(counts);

  return nodes;
};
