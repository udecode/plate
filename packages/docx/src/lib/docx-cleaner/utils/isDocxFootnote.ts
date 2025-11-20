/** Is element a docx footnote. */
export const isDocxFootnote = (element: Element): boolean =>
  element.tagName === 'SPAN' &&
  element.classList.contains('MsoFootnoteReference');
