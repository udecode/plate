import { parseDOMClipboardHtml } from '@platejs/plite-dom/internal';

/** Convert HTML string into HTML element. */
export const htmlStringToDOMNode = (rawHtml: string) =>
  parseDOMClipboardHtml(rawHtml).body;
