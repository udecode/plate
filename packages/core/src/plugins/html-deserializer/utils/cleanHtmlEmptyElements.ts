import { traverseHtmlElements } from './traverseHtmlElements';

const ALLOWED_EMPTY_ELEMENTS = new Set(['BR', 'IMG', 'TH', 'TD']);

const isEmpty = (element: Element): boolean => {
  return (
    !ALLOWED_EMPTY_ELEMENTS.has(element.nodeName) && !element.innerHTML.trim()
  );
};

const removeIfEmpty = (element: Element): void => {
  if (isEmpty(element)) {
    const { parentElement } = element;

    element.remove();

    if (parentElement) {
      removeIfEmpty(parentElement);
    }
  }
};

/**
 * Remove empty elements from rootNode.
 * Allowed empty elements: BR, IMG.
 */
export const cleanHtmlEmptyElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    removeIfEmpty(element);
    return true;
  });
};
