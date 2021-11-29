export const parseHtmlDocument = (html: string) => {
  return new DOMParser().parseFromString(html, 'text/html');
};
