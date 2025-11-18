export const parseHtmlDocument = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html');
