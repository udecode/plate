import {
  cleanHtmlBrElements,
  cleanHtmlEmptyElements,
  cleanHtmlFontElements,
  cleanHtmlLinkElements,
  cleanHtmlTextNodes,
  copyBlockMarksToSpanChild,
  postCleanHtml,
  preCleanHtml,
} from '@udecode/plate-common/server';

import {
  cleanDocxBrComments,
  cleanDocxEmptyParagraphs,
  cleanDocxFootnotes,
  cleanDocxImageElements,
  cleanDocxListElements,
  cleanDocxQuotes,
  cleanDocxSpans,
  isDocxContent,
} from './utils/index';

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

  // Prevent deserializeHtml from collapsing whitespace
  const preformattedWrapper = document.createElement('div');
  preformattedWrapper.style.whiteSpace = 'pre-wrap';
  preformattedWrapper.innerHTML = body.innerHTML;

  return postCleanHtml(preformattedWrapper.outerHTML);
};
