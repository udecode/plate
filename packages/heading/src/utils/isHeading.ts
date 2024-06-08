import type { ENode, Value } from '@udecode/plate-common';

import { KEYS_HEADING } from '../heading';

export const isHeading = (node: ENode<Value>) => {
  return node.type && KEYS_HEADING.includes(node.type as string);
};
