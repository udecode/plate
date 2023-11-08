import { collapseWhiteSpaceNode } from './collapseWhiteSpaceNode';
import { CollapseWhiteSpaceState } from './types';

export const collapseWhiteSpaceChildren = (
  node: Node,
  state: CollapseWhiteSpaceState
) => {
  const childNodes = Array.from(node.childNodes);

  for (const childNode of childNodes) {
    collapseWhiteSpaceNode(childNode, state);
  }
};
