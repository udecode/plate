import { changeTagName } from './changeTagName';
import { traverseHtmlElements } from './traverseHtmlElements';

export const cleanHtmlFontElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'FONT') {
      if (element.textContent) {
        changeTagName(element, 'span');
      } else {
        element.remove();
      }
    }

    return true;
  });
};
