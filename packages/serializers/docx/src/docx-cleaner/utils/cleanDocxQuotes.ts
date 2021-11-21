import { changeTagName } from './changeTagName';
import { traverseHtmlElements } from './traverseHtmlElements';

export const cleanDocxQuotes = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (
      element.parentNode &&
      element.tagName === 'P' &&
      element.classList.contains('MsoQuote')
    ) {
      changeTagName(element, 'blockquote');
    }

    return true;
  });
};
