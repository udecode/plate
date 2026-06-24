/** Get the slate nodes from the DOM selection */
/** @deprecated Use getSelectedDomFragment instead */
export const getSelectedDomBlocks = () => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  const domBlocks = fragment.querySelectorAll(
    '[data-plite-node="element"][data-plite-id]'
  );

  return Array.from(domBlocks);
};
