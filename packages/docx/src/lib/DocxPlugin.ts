import { type HtmlDeserializer, createBasePlugin } from '@platejs/core';
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

const parse: HtmlDeserializer['parse'] = ({ element, type }) => {
  if (isDocxList(element)) {
    const text = element.textContent ?? '';
    element.innerHTML = getDocxListContentHtml(element);

    return {
      indent: getDocxListIndent(element),
      listStyleType: getTextListStyleType(text) ?? 'disc',
      type,
    };
  }

  const indent = getDocxIndent(element);
  const textIndent = getDocxTextIndent(element);

  return {
    ...(indent ? { indent } : {}),
    ...(textIndent ? { textIndent } : {}),
    type,
  };
};

export const DocxPlugin = createBasePlugin({
  key: KEYS.docx,
  editOnly: true,
  inject: {
    parsers: {
      [KEYS.html]: {
        parser: {
          transformData: ({ data, source }) => {
            const rtf = source.getData('text/rtf');

            return cleanDocx(data, rtf);
          },
        },
      },
      ...Object.fromEntries(
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((key) => [
          key,
          {
            parsers: {
              html: {
                deserializer: {
                  parse,
                },
              },
            },
          },
        ])
      ),
      img: {
        parser: {
          query: ({ source }) => {
            const data = source.getData('text/html');
            const { body } = new DOMParser().parseFromString(data, 'text/html');

            return !isDocxContent(body);
          },
        },
      },
    },
  },
});
