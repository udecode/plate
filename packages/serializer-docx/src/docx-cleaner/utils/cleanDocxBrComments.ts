import {
  isHtmlComment,
  removeHtmlNodesBetweenComments,
  traverseHtmlElements,
} from '@udecode/plate-common/server';

/** Remove HTML nodes between comments in the next sibling after BR. */
export const cleanDocxBrComments = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName !== 'BR') {
      return true;
    }
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

    return false;
  });
};
