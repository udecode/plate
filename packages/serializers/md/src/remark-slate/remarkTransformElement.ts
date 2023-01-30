import { TElement, Value } from '@udecode/plate-core';
import { MdastNode, RemarkPluginOptions } from './types';

export const remarkTransformElement = <V extends Value>(
  node: MdastNode,
  options: RemarkPluginOptions<V>
): TElement | TElement[] => {
  const { elementRules } = options;

  const { type } = node;
  const elementRule = elementRules[type!];
  if (!elementRule) return [];

  return elementRule.transform(node, options);
};
