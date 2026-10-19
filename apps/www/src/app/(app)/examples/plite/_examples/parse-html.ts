const restoreAppleConvertedSpaces = (document: Document) => {
  document.querySelectorAll('span.Apple-converted-space').forEach((span) => {
    if (span.childNodes.length !== 1 || span.textContent !== '\u00A0') return;

    span.replaceWith(document.createTextNode(' '));
  });
};

export const parseExampleHtml = (html: string) => {
  const document = new DOMParser().parseFromString(html, 'text/html');

  restoreAppleConvertedSpaces(document);

  return document;
};
