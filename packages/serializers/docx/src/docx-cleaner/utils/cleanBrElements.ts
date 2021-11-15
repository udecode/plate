import { isHtmlComment } from '@udecode/plate-html-serializer';
import { LINE_FEED } from '../constants';
import { removeNodesBetweenComments } from './removeNodesBetweenComments';
import { traverseElements } from './traverseElements';

export const cleanBrElements = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
    if (element.tagName !== 'BR') {
      return true;
    }

    if (
      element.nextSibling &&
      isHtmlComment(element.nextSibling) &&
      element.nextSibling.data === '[if !supportLineBreakNewLine]'
    ) {
      removeNodesBetweenComments(
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
