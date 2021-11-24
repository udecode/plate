import { parseHtmlDocument } from './parseHtmlDocument';

export const parseHtmlElement = (html: string) => {
  const { body } = parseHtmlDocument(html);

  return body.firstElementChild as HTMLElement;
};
