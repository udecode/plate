import { isHtmlComment } from '@udecode/plate-html-serializer';
import { traverseComments } from './traverseComments';

export const removeNodesBetweenComments = (
  rootNode: Node,
  start: string,
  end: string
): void => {
  const isClosingComment = (node: Node) =>
    isHtmlComment(node) && node.data === end;

  traverseComments(rootNode, (comment) => {
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
