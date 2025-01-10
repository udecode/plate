import type { Descendant } from '@udecode/plate';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkTransformElementChildren = (
  node: MdastNode,
  options: RemarkPluginOptions
): Descendant[] => {
  const { children } = node;

  if (!children || children.length === 0) {
    return [{ text: '' }];
  }

  return children.flatMap((child) => remarkTransformNode(child, options));
};
