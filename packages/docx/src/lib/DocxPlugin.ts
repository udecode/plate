import {
  type BasePlugin,
  type HtmlDeserializer,
  createBasePlugin,
  KEYS,
} from 'platejs';

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
    plugins: {
      [KEYS.html]: {
        parser: {
          transformData: ({ data, dataTransfer }) => {
            const rtf = dataTransfer.getData('text/rtf');

            return cleanDocx(data, rtf);
          },
        },
      },
    },
  },
  override: {
    plugins: {
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
          } satisfies Partial<BasePlugin>,
        ])
      ),
      img: {
        parser: {
          query: ({ dataTransfer }) => {
            const data = dataTransfer.getData('text/html');
            const { body } = new DOMParser().parseFromString(data, 'text/html');

            return !isDocxContent(body);
          },
        },
      } satisfies Partial<BasePlugin>,
    },
  },
});
