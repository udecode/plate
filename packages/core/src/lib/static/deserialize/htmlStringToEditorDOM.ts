/**
 * Convert HTML string exported from Plate into HTML element.
 *
 * @param html - The HTML string to convert exported from Plate.
 * @returns The Editor element without head and body.
 */
export const getEditorDOMFromHtmlString = (html: string) => {
  const node = document.createElement('body');
  node.innerHTML = html;
  const editorNode = node.querySelector('[data-slate-editor="true"]');

  return editorNode as HTMLElement;
};
