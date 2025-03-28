import type { Descendant } from '@udecode/plate';
import type { Root } from 'mdast';

import type { MdRoot } from '../mdast';
import type { deserializeOptions } from './deserializeMd';

import { convertNodesDeserialize } from './convertNodesDeserialize';

export const mdastToSlate = (
  node: Root,
  options: deserializeOptions
): Descendant[] => {
  return buildSlateRoot(node, options);
};

const buildSlateRoot = (
  root: MdRoot,
  options: deserializeOptions
): Descendant[] => {
  return convertNodesDeserialize(root.children, {}, options);
};

