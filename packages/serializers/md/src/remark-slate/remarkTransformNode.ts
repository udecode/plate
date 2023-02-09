import { TDescendant, Value } from '@udecode/plate-core';
import { remarkTextTypes } from './remarkTextTypes';
import { remarkTransformElement } from './remarkTransformElement';
import { remarkTransformText } from './remarkTransformText';
import { MdastNode, RemarkPluginOptions } from './types';

export const remarkTransformNode = <V extends Value>(
  node: MdastNode,
  options: RemarkPluginOptions<V>
): TDescendant | TDescendant[] => {
  const { type } = node;

  if (remarkTextTypes.includes(type!)) {
    return remarkTransformText(node, options);
  }

  return remarkTransformElement(node, options);
};
