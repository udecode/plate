const parser = new DOMParser();

export const parseHtmlElement = (html: string) => {
  const { body } = parser.parseFromString(html, 'text/html');

  return body.firstElementChild as HTMLElement;
};
