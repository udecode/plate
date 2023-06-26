import { generateTabs } from './generateSpaces';

/**
 * Replace element with tabs if its style starts with 'mso-tab-count'.
 */
export const cleanDocxTabCount = (element: Element): void => {
  const styleAttribute = element.getAttribute('style') || '';

  if (!styleAttribute.startsWith('mso-tab-count:')) {
    return;
  }

  const [, countString] = styleAttribute.split(':');
  const count = Number.parseInt(countString, 10);
  const replacementNode = document.createTextNode(generateTabs(count));

  if (element.parentNode) {
    element.parentNode.replaceChild(replacementNode, element);
  }
};
