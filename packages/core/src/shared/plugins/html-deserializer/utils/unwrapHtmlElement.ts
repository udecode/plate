/**
 * Unwrap the given HTML element.
 */
export const unwrapHtmlElement = (element: Element): void => {
  element.outerHTML = element.innerHTML;
};
