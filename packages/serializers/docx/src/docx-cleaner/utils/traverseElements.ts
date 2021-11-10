import { isElement } from './isElement';
import { traverse } from './traverse';

type Callback = (node: Element) => boolean;

export const traverseElements = (rootNode: Node, callback: Callback): void => {
  traverse(rootNode, (node) => {
    if (!isElement(node)) {
      return true;
    }

    return callback(node);
  });
};
