import type { TElement } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

export const remarkTransformElement = (
  node: MdastNode,
  options: RemarkPluginOptions
): TElement | TElement[] => {
  const { elementRules } = options;

  const { type } = node;
  const elementRule = (elementRules as any)[type!];

  if (!elementRule) return [];

  return elementRule.transform(node, options);
};
