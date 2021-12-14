/**
 * Replace \r\n and \r with \n
 */
export const cleanHtmlCrLf = (html: string): string => {
  return html.replace(/(\r\n|\r)/gm, '\n');
};
