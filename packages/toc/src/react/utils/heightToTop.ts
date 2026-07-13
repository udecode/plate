export const heightToTop = (
  ele: HTMLElement,
  editorContent?: HTMLElement | null
) => {
  const root = editorContent ?? document.body;

  if (!root) return 0;

  const containerRect = root.getBoundingClientRect();
  const elementRect = ele.getBoundingClientRect();

  const scrollY = root.scrollTop;
  const absoluteElementTop = elementRect.top + scrollY - containerRect.top;

  return absoluteElementTop;
};
