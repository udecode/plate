import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { cleanDocx } from './docx-cleaner/cleanDocx';
import {
  getDocxIndent,
  getDocxTextIndent,
} from './docx-cleaner/utils/getDocxIndent';
import { getDocxListContentHtml } from './docx-cleaner/utils/getDocxListContentHtml';
import { getDocxListIndent } from './docx-cleaner/utils/getDocxListIndent';
import { getTextListStyleType } from './docx-cleaner/utils/getTextListStyleType';
import { isDocxContent } from './docx-cleaner/utils/isDocxContent';
import { isDocxList } from './docx-cleaner/utils/isDocxList';

const normalizeDocxData = (data: string, rtf: string) => {
  const document = new DOMParser().parseFromString(data, 'text/html');
  const { body } = document;

  if (!isDocxContent(body)) return cleanDocx(data, rtf);

  body.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((element) => {
    const htmlElement = element as HTMLElement;

    if (isDocxList(element)) {
      const listItem = document.createElement('li');

      Array.from(element.attributes).forEach(({ name, value }) => {
        listItem.setAttribute(name, value);
      });
      listItem.dataset.indent = String(getDocxListIndent(element));
      listItem.dataset.listStyleType =
        getTextListStyleType(element.textContent ?? '') ?? 'disc';
      listItem.innerHTML = getDocxListContentHtml(element);
      element.replaceWith(listItem);

      return;
    }

    const indent = getDocxIndent(htmlElement);
    const textIndent = getDocxTextIndent(htmlElement);

    if (indent) htmlElement.dataset.indent = String(indent);
    if (textIndent) htmlElement.dataset.textIndent = String(textIndent);
  });
  const cleaned = cleanDocx(body.innerHTML, rtf);
  const cleanedDocument = new DOMParser().parseFromString(cleaned, 'text/html');

  cleanedDocument.body.querySelectorAll('img').forEach((element) => {
    element.remove();
  });

  return cleanedDocument.body.outerHTML;
};

export const DocxPlugin = createBasePlugin({
  key: KEYS.docx,
  editOnly: true,
  parsers: {
    html: {
      transformData: ({ data, source }) =>
        normalizeDocxData(data, source.getData('text/rtf')),
    },
  },
});
