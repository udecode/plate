import { isHtmlBlockElement } from '../isHtmlBlockElement';

export const isLastNonEmptyTextOfInlineFormattingBlock = (
  initialText: Text
): boolean => {
  let currentNode: Node | null = initialText;

  while (true) {
    if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
    } else {
      // If there is no next sibling, ascend to the parent node
      currentNode = currentNode.parentElement;
      // If the parent node is a block, we've reached the end
      if (currentNode && isHtmlBlockElement(currentNode)) {
        return true;
      }
      // Otherwise, continue to the next sibling of the parent node
      currentNode = currentNode?.nextSibling || null;
    }

    // If there's no next node, we've reached the end
    if (!currentNode) {
      return true;
    }

    // If the next node is a block, we've reached the end
    if (isHtmlBlockElement(currentNode)) {
      return true;
    }

    // If the next node is a non-empty text node, we're not at the end
    if ((currentNode.textContent || '').length > 0) {
      return false;
    }

    // Otherwise, continue to the next node
  }
};
