import type { TNode } from '@udecode/plate-common';

import { KEYS_HEADING } from '../heading';

export const isHeading = (node: TNode) => {
  return node.type && KEYS_HEADING.includes(node.type as string);
};
