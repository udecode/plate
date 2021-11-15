export const unwrapElement = (element: Element): void => {
  element.outerHTML = element.innerHTML;
};
