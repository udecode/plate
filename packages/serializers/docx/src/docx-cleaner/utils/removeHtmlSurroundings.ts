const removeBeforeHtml = (html: string): string => {
  const index = html.indexOf('<html');
  if (index === -1) {
    return html;
  }
  return html.substring(index);
};

const removeAfterHtml = (html: string): string => {
  const index = html.lastIndexOf('</html>');
  if (index === -1) {
    return html;
  }
  return html.substring(0, index + '</html>'.length);
};

export const removeHtmlSurroundings = (html: string): string => {
  return removeBeforeHtml(removeAfterHtml(html));
};
