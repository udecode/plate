import type { Descendant } from '@udecode/plate';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkDefaultCompiler = (
  node: MdastNode,
  options: RemarkPluginOptions
): Descendant[] => {
  return (node.children || []).flatMap((child) =>
    remarkTransformNode(child, options)
  );
};
