import { isFragmentHref } from './isFragmentHref';
import { traverseElements } from './traverseElements';
import { unwrapElement } from './unwrapElement';

export const cleanLinkElements = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
    if (element.tagName !== 'A') {
      return true;
    }

    const href = element.getAttribute('href');

    if (!href || isFragmentHref(href)) {
      unwrapElement(element);
    }

    if (href && element.querySelector('img')) {
      for (const span of element.querySelectorAll('span')) {
        if (!span.innerText) {
          unwrapElement(span);
        }
      }
    }

    return true;
  });
};
