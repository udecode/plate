export const cleanHtmlCrLf = (html: string): string => {
  return html.replace(/(\r\n|\r)/gm, '\n');
};
