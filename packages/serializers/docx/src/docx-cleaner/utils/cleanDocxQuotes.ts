import { replaceTagName } from './replaceTagName';
import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Replace p.MsoQuote elements with blockquote.
 */
export const cleanDocxQuotes = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (
      element.parentNode &&
      element.tagName === 'P' &&
      element.classList.contains('MsoQuote')
    ) {
      replaceTagName(element, 'blockquote');
    }

    return true;
  });
};
