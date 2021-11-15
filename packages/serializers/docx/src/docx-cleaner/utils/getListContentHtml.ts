import { removeNodesBetweenComments } from './removeNodesBetweenComments';
import { traverseElements } from './traverseElements';

const HEADINGS_TAG_NAMES = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

export const getListContentHtml = (rootElement: Element): string => {
  const clonedElement = rootElement.cloneNode(true) as Element;

  if (HEADINGS_TAG_NAMES.includes(clonedElement.tagName)) {
    const heading = document.createElement(clonedElement.tagName);
    heading.innerHTML = clonedElement.innerHTML;
    clonedElement.innerHTML = heading.outerHTML;
  }

  removeNodesBetweenComments(clonedElement, '[if !supportLists]', '[endif]');

  traverseElements(clonedElement, (element) => {
    const styleAttribute = element.getAttribute('style');

    if (styleAttribute === 'mso-list:Ignore') {
      element.remove();
    }

    return true;
  });

  return clonedElement.innerHTML;
};
