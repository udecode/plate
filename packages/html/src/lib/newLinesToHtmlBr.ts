// Convert new line characters to HTML <br /> tags
export const newLinesToHtmlBr = (html: string): string =>
  html.replaceAll('\n', '<br />');
