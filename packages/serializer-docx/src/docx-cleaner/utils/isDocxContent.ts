import { traverseHtmlElements } from '@udecode/plate-common/server';

/**
 * Check if the element contains docx content.
 * True if one element has:
 * - style including 'mso-'
 * - className including 'Mso'
 */
export const isDocxContent = (body: HTMLElement): boolean => {
  let result = false;

  traverseHtmlElements(body, (element) => {
    const styleAttribute = element.getAttribute('style') || '';
    const classList = Array.from(element.classList);

    const isMsoElement =
      styleAttribute.includes('mso-') ||
      classList.some((className) => className.startsWith('Mso'));

    result = result || isMsoElement;

    return !result;
  });

  return result;
};
