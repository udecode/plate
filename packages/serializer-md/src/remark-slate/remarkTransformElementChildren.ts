import type { TDescendant, Value } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkTransformElementChildren = <V extends Value>(
  node: MdastNode,
  options: RemarkPluginOptions<V>
): TDescendant[] => {
  const { children } = node;

  if (!children) return [];

  return children.flatMap((child) => remarkTransformNode(child, options));
};
