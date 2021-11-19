import {
  cleanDocxListElementsToIndentList,
  cleanDocxQuotes,
  cleanDocxSpans,
  cleanHtmlBrElements,
  cleanHtmlEmptyElements,
  cleanHtmlEmptyParagraphs,
  cleanHtmlFontElements,
  cleanHtmlFootnotes,
  cleanHtmlImageElements,
  cleanHtmlLinkElements,
  cleanHtmlTextNodes,
  isDocxContent,
  postCleanHtml,
  preCleanHtml,
} from './utils';

const parser = new DOMParser();

export const cleanDocx = (html: string, rtf: string): string => {
  const document = parser.parseFromString(preCleanHtml(html), 'text/html');
  const { body } = document;

  if (!rtf && !isDocxContent(body)) {
    return html;
  }

  cleanHtmlFootnotes(body);
  cleanHtmlImageElements(document, rtf, body);
  cleanHtmlEmptyElements(body);
  cleanHtmlEmptyParagraphs(body);
  cleanDocxQuotes(body);
  cleanDocxSpans(body);
  cleanHtmlTextNodes(body);
  cleanHtmlBrElements(body);
  cleanHtmlLinkElements(body);
  cleanHtmlFontElements(body);
  cleanDocxListElementsToIndentList(body);

  return postCleanHtml(body.innerHTML);
};
