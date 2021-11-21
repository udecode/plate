import { removeHtmlNodesBetweenComments } from './removeHtmlNodesBetweenComments';
import { traverseHtmlElements } from './traverseHtmlElements';

const HEADINGS_TAG_NAMES = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export const getDocxListContentHtml = (rootElement: Element): string => {
  const clonedElement = rootElement.cloneNode(true) as Element;

  if (HEADINGS_TAG_NAMES.includes(clonedElement.tagName)) {
    const heading = document.createElement(clonedElement.tagName);
    heading.innerHTML = clonedElement.innerHTML;
    clonedElement.innerHTML = heading.outerHTML;
  }

  removeHtmlNodesBetweenComments(
    clonedElement,
    '[if !supportLists]',
    '[endif]'
  );

  traverseHtmlElements(clonedElement, (element) => {
    const styleAttribute = element.getAttribute('style');

    if (styleAttribute === 'mso-list:Ignore') {
      element.remove();
    }

    return true;
  });

  return clonedElement.innerHTML;
};
