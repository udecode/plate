import { LINE_FEED } from '../constants';
import { traverseHtmlElements } from './traverseHtmlElements';

/** Replace BR elements with line feeds. */
export const cleanHtmlBrElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName !== 'BR') {
      return true;
    }

    const replacementTextNode = document.createTextNode(LINE_FEED);

    if (element.parentElement) {
      element.parentElement.replaceChild(replacementTextNode, element);
    }

    return false;
  });
};
