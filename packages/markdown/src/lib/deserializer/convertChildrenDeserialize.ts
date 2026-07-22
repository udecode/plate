import type { Descendant } from '@platejs/plite';

import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const convertChildrenDeserialize = (
  children: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdContext
): Descendant[] => {
  if (children.length === 0) {
    return [{ text: '' }];
  }

  return convertNodesDeserialize(children, deco, options);
};
