import { parseHtmlDocument } from './parseHtmlDocument';

/** Convert HTML string into HTML element. */
export const htmlStringToDOMNode = (rawHtml: string) =>
  parseHtmlDocument(rawHtml).body;
