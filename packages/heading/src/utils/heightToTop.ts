import type React from 'react';

export const heightToTop = (
  ele: Element | HTMLElement,
  editorContentRef?: React.RefObject<HTMLDivElement>
) => {
  // ele为指定跳转到该位置的DOM节点
  const root = editorContentRef ? editorContentRef.current : document.body;
  let height = 0;

  do {
    height += (ele as HTMLElement).offsetTop;
    // eslint-disable-next-line no-param-reassign
    ele = (ele as HTMLElement).offsetParent as unknown as Element;
  } while (ele !== root);

  return height;
};
