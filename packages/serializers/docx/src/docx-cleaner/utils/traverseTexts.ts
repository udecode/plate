import { isHtmlText } from '@udecode/plate-core';
import { traverse } from './traverse';

type Callback = (node: Text) => boolean;

export const traverseTexts = (rootNode: Node, callback: Callback): void => {
  traverse(rootNode, (node) => {
    if (!isHtmlText(node)) {
      return true;
    }

    return callback(node);
  });
};
