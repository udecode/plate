export const setPositionAtSelection = (
  el: HTMLElement,
  direction: 'top' | 'bottom' = 'top'
) => {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount < 1) return;

  const domRange = domSelection.getRangeAt(0);
  const rect = domRange.getBoundingClientRect();

  if (direction === 'top') {
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
  } else {
    el.style.top = `${rect.bottom + window.pageYOffset}px`;
  }
  el.style.left = `${
    rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
  }px`;
};
