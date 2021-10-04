/**
 * Get bounding client rect of the window selection
 */
export const getSelectionBoundingClientRect = () => {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount < 1) return;

  const domRange = domSelection.getRangeAt(0);

  return domRange.getBoundingClientRect();
};
