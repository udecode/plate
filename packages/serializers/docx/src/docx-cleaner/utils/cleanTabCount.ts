import { generateSpaces } from './generateSpaces';

export const cleanTabCount = (element: Element): void => {
  const styleAttribute = element.getAttribute('style') || '';

  if (!styleAttribute.startsWith('mso-tab-count:')) {
    return;
  }

  const [, countString] = styleAttribute.split(':');
  const count = parseInt(countString, 10);
  const replacementNode = document.createTextNode(generateSpaces(count));

  if (element.parentNode) {
    element.parentNode.replaceChild(replacementNode, element);
  }
};
