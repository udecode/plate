export const isFootnote = (element: Element): boolean => {
  return (
    element.tagName === 'SPAN' &&
    element.classList.contains('MsoFootnoteReference')
  );
};
