import { NO_BREAK_SPACE } from '../constants';
import { traverseHtmlElements } from './traverseHtmlElements';

const isHtmlOpEmpty = (element: Element): boolean =>
  element.nodeName === 'O:P' && element.textContent === NO_BREAK_SPACE;

const isHtmlElementEmpty = (element: Element): boolean =>
  element.children.length === 1 &&
  element.firstElementChild !== null &&
  (isHtmlOpEmpty(element.firstElementChild) ||
    isHtmlElementEmpty(element.firstElementChild));

export const cleanHtmlEmptyParagraphs = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'P' && isHtmlElementEmpty(element)) {
      element.innerHTML = '';
    }

    return true;
  });
};
