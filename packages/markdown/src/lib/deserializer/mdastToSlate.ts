import type { Descendant } from '@udecode/plate';
import type { Root } from 'mdast';

import type { MdRoot } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const mdastToSlate = (
  node: Root,
  options: DeserializeMdOptions
): Descendant[] => {
  return buildSlateRoot(node, options);
};

const buildSlateRoot = (
  root: MdRoot,
  options: DeserializeMdOptions
): Descendant[] => {
  return convertNodesDeserialize(root.children, {}, options);
};
