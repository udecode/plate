import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';
import type { Decoration } from './type';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const convertChildrenDeserialize = (
  children: MdRootContent[],
  deco: Decoration,
  options: DeserializeMdOptions
): Descendant[] => {
  if (children.length === 0) {
    return [{ text: '' }];
  }

  return convertNodesDeserialize(children, deco, options);
};
