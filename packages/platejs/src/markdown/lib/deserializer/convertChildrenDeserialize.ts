import type { Descendant } from '../../../core';
import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdMarks } from '../types';
import { convertNodesDeserialize } from './convertNodesDeserialize';

export const convertChildrenDeserialize = (
  children: MdRootContent[],
  marks: MdMarks,
  options: DeserializeMdContext
): Descendant[] => {
  if (children.length === 0) {
    return [{ text: '' }];
  }

  return convertNodesDeserialize(children, marks, options);
};
