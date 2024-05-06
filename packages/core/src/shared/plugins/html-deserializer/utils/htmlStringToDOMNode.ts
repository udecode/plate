/** Convert HTML string into HTML element. */
export const htmlStringToDOMNode = (rawHtml: string) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml;

  return node;
};
