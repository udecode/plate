import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { deserializeOptions } from './deserializeMd';
import type { Decoration } from './type';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const convertChildren = (
  children: MdRootContent[],
  deco: Decoration,
  options: deserializeOptions
): Descendant[] => {
  if (children.length === 0) {
    return [{ text: '' }];
  }

  return convertNodesDeserialize(children, deco, options);
};
