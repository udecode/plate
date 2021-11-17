import { isHtmlComment } from '@udecode/plate-core';
import { traverse } from './traverse';

type Callback = (node: Comment) => boolean;

export const traverseComments = (rootNode: Node, callback: Callback): void => {
  traverse(rootNode, (node) => {
    if (!isHtmlComment(node)) {
      return true;
    }

    return callback(node);
  });
};
