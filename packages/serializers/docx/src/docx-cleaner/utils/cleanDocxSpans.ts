import { cleanDocxSpacerun } from './cleanDocxSpacerun';
import { cleanDocxTabCount } from './cleanDocxTabCount';
import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Clean docx spaceruns and tab counts.
 */
export const cleanDocxSpans = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.nodeName !== 'SPAN') {
      return true;
    }

    cleanDocxSpacerun(element);
    cleanDocxTabCount(element);

    return true;
  });
};
