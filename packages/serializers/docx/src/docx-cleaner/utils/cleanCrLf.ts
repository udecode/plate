export const cleanCrLf = (html: string): string => {
  return html.replace(/(\r\n|\r)/gm, '\n');
};
