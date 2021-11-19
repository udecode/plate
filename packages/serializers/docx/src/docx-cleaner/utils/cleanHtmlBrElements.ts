import { isHtmlComment } from '@udecode/plate-core';
import { LINE_FEED } from '../constants';
import { removeHtmlNodesBetweenComments } from './removeHtmlNodesBetweenComments';
import { traverseHtmlElements } from './traverseHtmlElements';

export const cleanHtmlBrElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName !== 'BR') {
      return true;
    }

    // docx
    if (
      element.nextSibling &&
      isHtmlComment(element.nextSibling) &&
      element.nextSibling.data === '[if !supportLineBreakNewLine]'
    ) {
      removeHtmlNodesBetweenComments(
        element.nextSibling,
        '[if !supportLineBreakNewLine]',
        '[endif]'
      );
    }

    const replacementTextNode = document.createTextNode(LINE_FEED);

    if (element.parentElement) {
      element.parentElement.replaceChild(replacementTextNode, element);
    }

    return false;
  });
};
