/** Get the slate nodes from the DOM selection */
export const getSelectedDomBlocks = () => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  const domBlocks = fragment.querySelectorAll(
    '[data-slate-node="element"][data-slate-id]'
  );

  return Array.from(domBlocks);
};
