import { generateSpaces } from './generateSpaces';

/**
 * Replace the element with spaces if its style includes 'mso-spacerun: yes'.
 */
export const cleanDocxSpacerun = (element: Element): void => {
  const styleAttribute = element.getAttribute('style');

  if (
    !(
      styleAttribute &&
      ['mso-spacerun:yes', 'mso-spacerun: yes'].includes(styleAttribute)
    )
  ) {
    return;
  }

  const spacesCount = (element.textContent || '').length;
  const replacementNode = document.createTextNode(generateSpaces(spacesCount));

  if (element.parentNode) {
    element.parentNode.replaceChild(replacementNode, element);
  }
};
