import { replaceTagName } from './replaceTagName';
import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Replace FONT elements with SPAN elements if there is textContent (remove otherwise).
 */
export const cleanHtmlFontElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'FONT') {
      if (element.textContent) {
        replaceTagName(element, 'span');
      } else {
        element.remove();
      }
    }

    return true;
  });
};
