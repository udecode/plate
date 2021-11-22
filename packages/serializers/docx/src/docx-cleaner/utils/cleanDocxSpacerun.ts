import { generateSpaces } from './generateSpaces';

export const cleanDocxSpacerun = (element: Element): void => {
  const styleAttribute = element.getAttribute('style');

  if (styleAttribute !== 'mso-spacerun:yes') {
    return;
  }

  const spacesCount = (element.textContent || '').length;
  const replacementNode = document.createTextNode(generateSpaces(spacesCount));

  if (element.parentNode) {
    element.parentNode.replaceChild(replacementNode, element);
  }
};
