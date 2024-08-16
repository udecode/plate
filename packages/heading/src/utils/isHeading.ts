import type { TNode } from '@udecode/plate-common';

import { HEADING_LEVELS } from '../heading';

export const isHeading = (node: TNode) => {
  return node.type && HEADING_LEVELS.includes(node.type as any);
};
