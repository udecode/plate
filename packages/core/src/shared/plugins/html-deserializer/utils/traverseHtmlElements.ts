import { isHtmlElement } from './isHtmlElement';
import { traverseHtmlNode } from './traverseHtmlNode';

type Callback = (node: Element) => boolean;

/**
 * Traverse the HTML elements of the given HTML node.
 *
 * @param rootNode The root HTML node to traverse.
 * @param callback The callback to call for each HTML element.
 */
export const traverseHtmlElements = (
  rootNode: Node,
  callback: Callback
): void => {
  traverseHtmlNode(rootNode, (node) => {
    if (!isHtmlElement(node)) {
      return true;
    }

    return callback(node);
  });
};
