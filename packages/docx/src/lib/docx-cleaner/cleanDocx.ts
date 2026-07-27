import {
  isHtmlBlockElement,
  isHtmlText,
  postCleanHtml,
  replaceTagName,
  traverseHtmlElements,
  traverseHtmlNode,
} from '@platejs/core/internal';

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
  const endIndex = html.lastIndexOf('</html>');
  const withoutTrailing =
    endIndex === -1 ? html : html.slice(0, endIndex + '</html>'.length);
  const startIndex = withoutTrailing.indexOf('<html');
  const normalizedHtml = (
    startIndex === -1 ? withoutTrailing : withoutTrailing.slice(startIndex)
  ).replaceAll(/\r\n|\r/g, '\n');
  const document = new DOMParser().parseFromString(normalizedHtml, 'text/html');
  const { body } = document;

  if (!rtf && !isDocxContent(body)) {
    return html;
  }

  cleanDocxFootnotes(body);
  cleanDocxImageElements(document, rtf, body);

  {
    const allowedEmptyElements = new Set(['BR', 'IMG', 'TD', 'TH']);
    const removeIfEmpty = (element: Element): void => {
      if (
        allowedEmptyElements.has(element.nodeName) ||
        element.innerHTML.trim()
      ) {
        return;
      }

      const { parentElement } = element;

      element.remove();
      if (parentElement) removeIfEmpty(parentElement);
    };

    traverseHtmlElements(body, (element) => {
      removeIfEmpty(element);

      return true;
    });
  }

  cleanDocxEmptyParagraphs(body);
  cleanDocxQuotes(body);
  cleanDocxSpans(body);

  traverseHtmlNode(body, (node) => {
    if (!isHtmlText(node)) return true;
    if (
      node.data.startsWith('\n') &&
      node.data.trim().length === 0 &&
      (node.previousElementSibling || node.nextElementSibling)
    ) {
      node.remove();

      return true;
    }

    node.data = node.data.replaceAll(/\n\s*/g, '\n');

    if (
      node.data.includes('\r') ||
      node.data.includes('\n') ||
      node.data.includes('\u00A0')
    ) {
      const hasSpace = node.data.includes(' ');
      const hasNonWhitespace = node.data.trim().length > 0;
      const hasLineFeed = node.data.includes('\n');

      if (!(hasSpace || hasNonWhitespace) && !hasLineFeed) {
        if (node.data === '\u00A0') {
          node.data = ' ';

          return true;
        }

        node.remove();

        return true;
      }
      if (node.previousSibling?.nodeName === 'BR' && node.parentElement) {
        node.previousSibling.remove();

        let offset = 0;

        while (node.data[offset] === '\n' || node.data[offset] === '\r') {
          offset++;
        }

        node.data = node.data
          .slice(Math.max(0, offset))
          .replaceAll('\n', ' ')
          .replaceAll('\r', ' ');
        node.data = `\n${node.data}`;
      } else {
        node.data = node.data.replaceAll('\n', ' ').replaceAll('\r', ' ');
      }
    }

    return true;
  });

  cleanDocxBrComments(body);

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'BR') return true;

    element.parentElement?.replaceChild(document.createTextNode('\n'), element);

    return false;
  });

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'A') return true;

    const href = element.getAttribute('href');

    if (!href || href.startsWith('#')) {
      element.outerHTML = element.innerHTML;
    }
    if (href && element.querySelector('img')) {
      for (const span of element.querySelectorAll('span')) {
        if (!span.textContent) span.outerHTML = span.innerHTML;
      }
    }

    return true;
  });

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'FONT') return true;

    if (element.textContent) {
      replaceTagName(element, 'span');
    } else {
      element.remove();
    }

    return true;
  });

  cleanDocxListElements(body);

  traverseHtmlElements(body, (element) => {
    const htmlElement = element as HTMLElement;

    if (
      !element.hasAttribute('style') ||
      !isHtmlBlockElement(htmlElement) ||
      htmlElement.nodeName === 'TABLE'
    ) {
      return true;
    }

    const {
      style: {
        backgroundColor,
        color,
        fontFamily,
        fontSize,
        fontStyle,
        fontWeight,
        textDecoration,
      },
    } = htmlElement;

    if (
      !backgroundColor &&
      !color &&
      !fontFamily &&
      !fontSize &&
      !fontStyle &&
      !fontWeight &&
      !textDecoration
    ) {
      return true;
    }

    const span = document.createElement('span');

    if (!['inherit', 'initial'].includes(color)) span.style.color = color;

    span.style.fontFamily = fontFamily;
    span.style.fontSize = fontSize;

    if (!['inherit', 'initial', 'normal'].includes(color)) {
      span.style.fontStyle = fontStyle;
    }
    if (![400, 'normal'].includes(fontWeight)) {
      span.style.fontWeight = fontWeight;
    }

    span.style.textDecoration = textDecoration;
    span.innerHTML = htmlElement.innerHTML;
    element.innerHTML = span.outerHTML;

    return true;
  });

  // Preserve whitespace during HTML decoding.
  const preformattedWrapper = document.createElement('div');
  preformattedWrapper.style.whiteSpace = 'pre-wrap';
  preformattedWrapper.innerHTML = body.innerHTML;

  return postCleanHtml(preformattedWrapper.outerHTML);
};
