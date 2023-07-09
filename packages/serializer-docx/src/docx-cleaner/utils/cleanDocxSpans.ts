import { traverseHtmlElements } from '@udecode/plate-common';

import { cleanDocxSpacerun } from './cleanDocxSpacerun';
import { cleanDocxTabCount } from './cleanDocxTabCount';

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
