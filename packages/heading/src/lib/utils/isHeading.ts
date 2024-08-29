import type { TNode } from '@udecode/plate-common';

import { HEADING_LEVELS } from '../constants';

export const isHeading = (node: TNode) => {
  return node.type && HEADING_LEVELS.includes(node.type as any);
};
