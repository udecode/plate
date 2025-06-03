export const findHtmlParentElement = (
  el: HTMLElement | null,
  nodeName: string
): HTMLElement | null => {
  if (!el || el.nodeName === nodeName) {
    return el;
  }

  return findHtmlParentElement(el.parentElement, nodeName);
};
