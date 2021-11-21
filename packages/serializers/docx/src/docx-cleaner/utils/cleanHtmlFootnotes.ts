import { isDocxFootnote } from './isDocxFootnote';
import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Gets "4" from "[4]", "A" from "[A]", etc.
 */
const extractFootnoteNumber = (footnote: Element): string => {
  return (footnote.textContent || '').trim().replace(/[[\]]/g, '');
};

export const cleanHtmlFootnotes = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (isDocxFootnote(element)) {
      const footnoteReplacement = document.createElement('sup');
      footnoteReplacement.textContent = extractFootnoteNumber(element);

      if (element.parentElement) {
        element.parentElement.replaceChild(footnoteReplacement, element);
      }

      return true;
    }

    return true;
  });
};
