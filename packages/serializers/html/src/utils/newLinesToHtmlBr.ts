// Convert new line characters to HTML <br /> tags
export const newLinesToHtmlBr = (html: string): string =>
  html.replace(/\n/g, '<br />');
