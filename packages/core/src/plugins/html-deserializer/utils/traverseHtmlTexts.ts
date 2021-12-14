import { isHtmlText } from './isHtmlText';
import { traverseHtmlNode } from './traverseHtmlNode';

type Callback = (node: Text) => boolean;

export const traverseHtmlTexts = (rootNode: Node, callback: Callback): void => {
  traverseHtmlNode(rootNode, (node) => {
    if (!isHtmlText(node)) {
      return true;
    }

    return callback(node);
  });
};
