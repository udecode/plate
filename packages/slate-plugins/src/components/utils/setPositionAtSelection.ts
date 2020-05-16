export const setPositionAtSelection = (el: HTMLElement) => {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount < 1) return;

  const domRange = domSelection.getRangeAt(0);
  const rect = domRange.getBoundingClientRect();

  el.style.opacity = '1';
  el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
  el.style.left = `${
    rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
  }px`;
};
