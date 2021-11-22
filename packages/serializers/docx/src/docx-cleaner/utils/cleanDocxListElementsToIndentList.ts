import { traverseHtmlElements } from './traverseHtmlElements';

export const cleanDocxListElementsToIndentList = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    const styleAttribute = element.getAttribute('style');

    if (styleAttribute) {
      element.setAttribute(
        'style',
        styleAttribute.replace(/mso-list:\s*Ignore/gim, 'mso-list:Ignore')
      );
    }

    return true;
  });
};
