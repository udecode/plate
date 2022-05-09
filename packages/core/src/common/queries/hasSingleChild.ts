import { isText } from '../../slate/text/isText';
import { TNode } from '../../slate/node/TNode';

export const hasSingleChild = <N extends TNode>(node: N): boolean => {
  if (isText(node)) {
    return true;
  }
  return node.children.length === 1 && hasSingleChild(node.children[0]);
};
