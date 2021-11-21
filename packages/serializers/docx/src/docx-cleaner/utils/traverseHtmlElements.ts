import { isHtmlElement } from '@udecode/plate-core';
import { traverseHtmlNode } from './traverseHtmlNode';

type Callback = (node: Element) => boolean;

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
