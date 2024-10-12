import type { TDescendant } from '@udecode/plate-common';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkTransformElementChildren = (
  node: MdastNode,
  options: RemarkPluginOptions
): TDescendant[] => {
  const { children } = node;

  if (!children || children.length === 0) {
    return [{ text: '' }];
  }

  return children.flatMap((child) => remarkTransformNode(child, options));
};
