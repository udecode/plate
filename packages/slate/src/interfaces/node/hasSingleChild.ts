import type { TNode } from './TNode';

import { isText } from '../text/isText';

export const hasSingleChild = <N extends TNode>(node: N): boolean => {
  if (isText(node)) {
    return true;
  }

  return node.children.length === 1 && hasSingleChild(node.children[0]);
};
