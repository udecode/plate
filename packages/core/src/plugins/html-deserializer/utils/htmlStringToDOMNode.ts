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
    node.innerHTML = node.innerHTML.replaceAll(/(\r\n|[\t\n\r])/g, '');
  }

  return node;
};
