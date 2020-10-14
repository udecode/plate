/**
 * Convert HTML string into HTML element.
 */
export const htmlStringToDOMNode = (rawHtml: string) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');
  return node;
};
