import { NO_BREAK_SPACE, traverseHtmlElements } from '@udecode/plate-common/server';

const isHtmlOpEmpty = (element: Element): boolean =>
  element.nodeName === 'O:P' && element.textContent === NO_BREAK_SPACE;

const isHtmlElementEmpty = (element: Element): boolean =>
  element.children.length === 1 &&
  element.firstElementChild !== null &&
  (isHtmlOpEmpty(element.firstElementChild) ||
    isHtmlElementEmpty(element.firstElementChild));

/**
 * Remove paragraph innerHTML if its child is 'O:P' with NO_BREAK_SPACE.
 */
export const cleanDocxEmptyParagraphs = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'P' && isHtmlElementEmpty(element)) {
      element.innerHTML = '';
    }

    return true;
  });
};
