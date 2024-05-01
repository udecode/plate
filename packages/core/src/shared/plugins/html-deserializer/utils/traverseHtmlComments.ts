import { isHtmlComment } from './isHtmlComment';
import { traverseHtmlNode } from './traverseHtmlNode';

type Callback = (node: Comment) => boolean;

/**
 * Traverse HTML comments.
 */
export const traverseHtmlComments = (
  rootNode: Node,
  callback: Callback
): void => {
  traverseHtmlNode(rootNode, (node) => {
    if (!isHtmlComment(node)) {
      return true;
    }

    return callback(node);
  });
};
