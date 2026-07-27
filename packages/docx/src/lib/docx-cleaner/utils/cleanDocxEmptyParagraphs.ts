import { traverseHtmlElements } from '@platejs/core/internal';

const isHtmlOpEmpty = (element: Element): boolean =>
  element.nodeName === 'O:P' && element.textContent === '\u00A0';

const isHtmlElementEmpty = (element: Element): boolean =>
  element.children.length === 1 &&
  element.firstElementChild !== null &&
  (isHtmlOpEmpty(element.firstElementChild) ||
    isHtmlElementEmpty(element.firstElementChild));

/** Remove paragraph contents when its only descendant is an empty `O:P`. */
export const cleanDocxEmptyParagraphs = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'P' && isHtmlElementEmpty(element)) {
      element.innerHTML = '';
    }

    return true;
  });
};
