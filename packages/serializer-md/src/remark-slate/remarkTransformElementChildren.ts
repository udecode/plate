import type { TDescendant } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkTransformElementChildren = (
  node: MdastNode,
  options: RemarkPluginOptions
): TDescendant[] => {
  const { children } = node;

  if (!children) return [];

  return children.flatMap((child) => remarkTransformNode(child, options));
};
