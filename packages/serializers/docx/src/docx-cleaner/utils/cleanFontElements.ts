import { changeTagName } from './changeTagName';
import { traverseElements } from './traverseElements';

export const cleanFontElements = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
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
