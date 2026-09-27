export const parseExampleHtml = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html');
