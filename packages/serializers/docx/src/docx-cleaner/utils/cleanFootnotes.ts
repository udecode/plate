import { isFootnote } from './isFootnote';
import { traverseElements } from './traverseElements';

/**
 * Gets "4" from "[4]", "A" from "[A]", etc.
 */
const extractFootnoteNumber = (footnote: Element): string => {
  return (footnote.textContent || '').trim().replace(/[[\]]/g, '');
};

export const cleanFootnotes = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
    if (isFootnote(element)) {
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
