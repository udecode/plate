type Callback = (node: Node) => boolean;

/**
 * Depth-first pre-order tree traversal
 * see: https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR)
 *
 * @param callback returns a boolean indicating whether traversal should be continued
 */
export const traverse = (node: Node, callback: Callback): void => {
  const keepTraversing = callback(node);

  if (!keepTraversing) {
    return;
  }

  let child = node.firstChild;

  while (child) {
    const currentChild = child;
    const previousChild = child.previousSibling;
    child = child.nextSibling;

    traverse(currentChild, callback);

    if (
      // An unwrap was made. Need to compute the next child again.
      !currentChild.previousSibling &&
      !currentChild.nextSibling &&
      !currentChild.parentNode &&
      child &&
      previousChild !== child.previousSibling &&
      child.parentNode
    ) {
      if (previousChild) {
        child = previousChild.nextSibling;
      } else {
        child = node.firstChild;
      }
    } else if (
      // A list was created. Need to compute the next child again.
      !currentChild.previousSibling &&
      !currentChild.nextSibling &&
      !currentChild.parentNode &&
      child &&
      !child.previousSibling &&
      !child.nextSibling &&
      !child.parentNode
    ) {
      if (previousChild) {
        if (previousChild.nextSibling) {
          child = previousChild.nextSibling.nextSibling;
        } else {
          child = null;
        }
      } else if (node.firstChild) {
        child = node.firstChild.nextSibling;
      }
    }
  }
};
