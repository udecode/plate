/** Replace \r\n and \r with \n */
export const cleanHtmlCrLf = (html: string): string =>
  html.replaceAll(/\r\n|\r/g, '\n');
