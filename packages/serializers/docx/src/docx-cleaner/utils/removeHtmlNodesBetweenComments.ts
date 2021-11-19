import { isHtmlComment } from '@udecode/plate-core';
import { traverseHtmlComments } from './traverseHtmlComments';

export const removeHtmlNodesBetweenComments = (
  rootNode: Node,
  start: string,
  end: string
): void => {
  const isClosingComment = (node: Node) =>
    isHtmlComment(node) && node.data === end;

  traverseHtmlComments(rootNode, (comment) => {
    if (comment.data === start) {
      let node = comment.nextSibling;

      comment.remove();

      while (node && !isClosingComment(node)) {
        const { nextSibling } = node;
        node.remove();
        node = nextSibling;
      }

      if (node && isClosingComment(node)) {
        node.remove();
      }
    }

    return true;
  });
};
