import { isComment } from './isComment';
import { traverseComments } from './traverseComments';

export const removeNodesBetweenComments = (
  rootNode: Node,
  start: string,
  end: string
): void => {
  const isClosingComment = (node: Node) => isComment(node) && node.data === end;

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
