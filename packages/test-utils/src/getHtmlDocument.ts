export const getHtmlDocument = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html');
