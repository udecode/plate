import { copyBlockMarksToSpanChild } from './utils/copyBlockMarksToSpanChild';
import {
  cleanDocxBrComments,
  cleanDocxEmptyParagraphs,
  cleanDocxFootnotes,
  cleanDocxImageElements,
  cleanDocxListElements,
  cleanDocxQuotes,
  cleanDocxSpans,
  cleanHtmlBrElements,
  cleanHtmlEmptyElements,
  cleanHtmlFontElements,
  cleanHtmlLinkElements,
  cleanHtmlTextNodes,
  isDocxContent,
  postCleanHtml,
  preCleanHtml,
} from './utils';

export const cleanDocx = (html: string, rtf: string): string => {
  const document = new DOMParser().parseFromString(
    preCleanHtml(html),
    'text/html'
  );
  const { body } = document;

  if (!rtf && !isDocxContent(body)) {
    return html;
  }

  cleanDocxFootnotes(body);
  cleanDocxImageElements(document, rtf, body);
  cleanHtmlEmptyElements(body);
  cleanDocxEmptyParagraphs(body);
  cleanDocxQuotes(body);
  cleanDocxSpans(body);
  cleanHtmlTextNodes(body);
  cleanDocxBrComments(body);
  cleanHtmlBrElements(body);
  cleanHtmlLinkElements(body);
  cleanHtmlFontElements(body);
  cleanDocxListElements(body);
  copyBlockMarksToSpanChild(body);

  return postCleanHtml(body.innerHTML);
};
