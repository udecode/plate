/** Get the DOM node from the DOM selection */
export const getSelectedDomNode = () => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);

  const htmlFragment = range.cloneContents();
  const div = document.createElement('div');
  div.append(htmlFragment);

  return div;
};
