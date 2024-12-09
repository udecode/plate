import type { TDescendant } from '@udecode/plate-common';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkDefaultCompiler = (
  node: MdastNode,
  options: RemarkPluginOptions
): TDescendant[] => {
  return (node.children || []).flatMap((child) =>
    remarkTransformNode(child, options)
  );
};
