import {
  type DeserializeHtml,
  DeserializeHtmlPlugin,
  createPlugin,
} from '@udecode/plate-common';

import { cleanDocx } from '../docx-cleaner/cleanDocx';
import {
  getDocxIndent,
  getDocxTextIndent,
} from '../docx-cleaner/utils/getDocxIndent';
import { getDocxListContentHtml } from '../docx-cleaner/utils/getDocxListContentHtml';
import { getDocxListIndent } from '../docx-cleaner/utils/getDocxListIndent';
import { getTextListStyleType } from '../docx-cleaner/utils/getTextListStyleType';
import { isDocxContent } from '../docx-cleaner/utils/isDocxContent';
import { isDocxList } from '../docx-cleaner/utils/isDocxList';

const getListNode =
  (type: string): DeserializeHtml['getNode'] =>
  ({ element }) => {
    const node: any = { type };

    if (isDocxList(element)) {
      node.indent = getDocxListIndent(element);

      const text = element.textContent ?? '';

      node.listStyleType = getTextListStyleType(text) ?? 'disc';

      element.innerHTML = getDocxListContentHtml(element);
    } else {
      const indent = getDocxIndent(element);

      if (indent) {
        node.indent = indent;
      }

      const textIndent = getDocxTextIndent(element);

      if (textIndent) {
        node.textIndent = textIndent;
      }
    }

    return node;
  };

export const DeserializeDocxPlugin = createPlugin((editor) => ({
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
        editor: {
          insertData: {
            transformData: ({ data, dataTransfer }) => {
              const rtf = dataTransfer.getData('text/rtf');

              return cleanDocx(data, rtf);
            },
          },
        },
      },
    },
  },
  key: 'deserializeDocx',
  override: {
    plugins: {
      ...Object.fromEntries(
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((key) => [
          key,
          {
            deserializeHtml: {
              getNode: getListNode(editor.getType({ key })),
            },
          },
        ])
      ),
      img: {
        editor: {
          insertData: {
            query: ({ dataTransfer }) => {
              const data = dataTransfer.getData('text/html');
              const { body } = new DOMParser().parseFromString(
                data,
                'text/html'
              );

              return !isDocxContent(body);
            },
          },
        },
      },
    },
  },
}));
