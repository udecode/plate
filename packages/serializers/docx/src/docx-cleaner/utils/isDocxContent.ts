import { traverseElements } from './traverseElements';

export const isDocxContent = (body: HTMLElement): boolean => {
  let result = false;

  traverseElements(body, (element) => {
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
