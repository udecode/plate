/**
 * Remove string before <html
 */
const removeBeforeHtml = (html: string): string => {
  const index = html.indexOf('<html');
  if (index === -1) {
    return html;
  }
  return html.slice(Math.max(0, index));
};

/**
 * Remove string after </html>
 */
const removeAfterHtml = (html: string): string => {
  const index = html.lastIndexOf('</html>');
  if (index === -1) {
    return html;
  }
  return html.slice(0, Math.max(0, index + '</html>'.length));
};

/**
 * Remove string before <html and after </html>
 */
export const removeHtmlSurroundings = (html: string): string => {
  return removeBeforeHtml(removeAfterHtml(html));
};
