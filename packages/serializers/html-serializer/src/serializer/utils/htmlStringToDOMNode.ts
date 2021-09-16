/**
 * Convert HTML string into HTML element.
 */
export const htmlStringToDOMNode = (
  rawHtml: string,
  stripWhitespace = true
) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml;

  if (stripWhitespace) {
    node.innerHTML = node.innerHTML.replace(/(\r\n|\n|\r|\t)/gm, '');
  }

  return node;
};
