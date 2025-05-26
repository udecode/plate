import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const convertChildrenDeserialize = (
  children: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  if (children.length === 0) {
    return [{ text: '' }];
  }

  return convertNodesDeserialize(children, deco, options);
};
