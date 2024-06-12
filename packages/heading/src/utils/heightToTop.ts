import type React from 'react';

export const heightToTop = (
  ele: HTMLElement,
  editorContentRef?: React.RefObject<HTMLDivElement>
) => {
  const root = editorContentRef ? editorContentRef.current : document.body;

  if (!root || !ele) return 0;

  const containerRect = root.getBoundingClientRect();
  const elementRect = ele.getBoundingClientRect();

  const scrollY = root.scrollTop;
  const absoluteElementTop = elementRect.top + scrollY - containerRect.top;

  return absoluteElementTop;
};
