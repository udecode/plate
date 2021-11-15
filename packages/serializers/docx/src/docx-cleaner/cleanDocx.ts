import {
  cleanBrElements,
  cleanEmptyElements,
  cleanEmptyParagraphs,
  cleanFontElements,
  cleanFootnotes,
  cleanImageElements,
  cleanLinkElements,
  cleanListElements,
  cleanQuotes,
  cleanSpans,
  cleanTextNodes,
  isDocxContent,
  postCleanHtml,
  preCleanHtml,
} from './utils';

const parser = new DOMParser();

const cleanDocx = (html: string, rtf: string): string => {
  const document = parser.parseFromString(preCleanHtml(html), 'text/html');
  const { body } = document;

  if (!rtf && !isDocxContent(body)) {
    return html;
  }

  cleanFootnotes(body);
  cleanImageElements(document, rtf, body);
  cleanEmptyElements(body);
  cleanEmptyParagraphs(body);
  cleanQuotes(body);
  cleanSpans(body);
  cleanTextNodes(body);
  cleanBrElements(body);
  cleanLinkElements(body);
  cleanFontElements(body);
  cleanListElements(body);

  return postCleanHtml(body.innerHTML);
};

export default cleanDocx;
