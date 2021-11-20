export const parseHtmlElement = (html: string) => {
  const { body } = new DOMParser().parseFromString(html, 'text/html');

  return body.firstElementChild as HTMLElement;
};
