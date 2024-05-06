export const isDocxBookmark = (element: Element): boolean => {
  const styleAttribute = element.getAttribute('style');

  return (
    (styleAttribute || '').startsWith('mso-bookmark') && !element.textContent
  );
};
