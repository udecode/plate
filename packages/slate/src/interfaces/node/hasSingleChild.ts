import type { TNode } from './TNode';

import { TextApi } from '../text';

export const hasSingleChild = <N extends TNode>(node: N): boolean => {
  if (TextApi.isText(node)) {
    return true;
  }

  return node.children.length === 1 && hasSingleChild(node.children[0]);
};
