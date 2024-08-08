import type { TDescendant } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTextTypes } from './remarkTextTypes';
import { remarkTransformElement } from './remarkTransformElement';
import { remarkTransformText } from './remarkTransformText';

export const remarkTransformNode = (
  node: MdastNode,
  options: RemarkPluginOptions
): TDescendant | TDescendant[] => {
  const { type } = node;

  if (remarkTextTypes.includes(type!)) {
    return remarkTransformText(node, options);
  }

  return remarkTransformElement(node, options);
};
