export const readBrowserTextTarget = ({
  selector,
  viewportSelector,
  inset = 0,
  placement = 'start',
}) => {
  const viewport = viewportSelector
    ? document.querySelector(viewportSelector)?.getBoundingClientRect()
    : null;
  const top = Math.max(0, viewport?.top ?? 0) + inset;
  const bottom = Math.min(innerHeight, viewport?.bottom ?? innerHeight) - inset;

  for (const element of document.querySelectorAll(selector)) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const rects = [];
    let text = walker.nextNode();

    while (text) {
      if (
        text.textContent?.replace(/\uFEFF/g, '').trim() &&
        text.parentElement?.closest('[data-plite-node="text"]')
      ) {
        // Text flows can omit leaf wrappers or give them display: contents.
        const range = document.createRange();
        range.selectNodeContents(text);
        rects.push(
          ...Array.from(range.getClientRects()).filter(
            (rect) =>
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom > top &&
              rect.top < bottom
          )
        );
      }
      text = walker.nextNode();
    }

    const rect = placement === 'end' ? rects.at(-1) : rects[0];
    if (!rect) continue;

    const left = rect.left + Math.min(4, rect.width / 2);
    const right = rect.right - Math.min(4, rect.width / 2);

    return {
      blockText: element.textContent ?? '',
      path: element.getAttribute('data-plite-path'),
      x:
        placement === 'end'
          ? right
          : placement === 'center'
            ? (left + right) / 2
            : Math.min(right, rect.left + 60),
      y: (Math.max(top, rect.top) + Math.min(bottom, rect.bottom)) / 2,
    };
  }

  return null;
};
