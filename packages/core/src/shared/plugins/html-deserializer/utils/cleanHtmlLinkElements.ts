import { isHtmlFragmentHref } from './isHtmlFragmentHref';
import { traverseHtmlElements } from './traverseHtmlElements';
import { unwrapHtmlElement } from './unwrapHtmlElement';

/** Remove fragment hrefs and spans without inner text. */
export const cleanHtmlLinkElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName !== 'A') {
      return true;
    }

    const href = element.getAttribute('href');

    if (!href || isHtmlFragmentHref(href)) {
      unwrapHtmlElement(element);
    }
    if (href && element.querySelector('img')) {
      for (const span of element.querySelectorAll('span')) {
        if (!span.textContent) {
          unwrapHtmlElement(span);
        }
      }
    }

    return true;
  });
};
