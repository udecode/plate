import type { AnyPlatePlugin } from '@udecode/plate-common';

import {
  type DeserializeHtml,
  KEY_DESERIALIZE_HTML,
  createPlugin,
} from '@udecode/plate-common/server';

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

export const KEY_DESERIALIZE_DOCX = 'deserializeDocx';

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

const KEYS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const overrideByKey: Record<string, Partial<AnyPlatePlugin>> = {};

KEYS.forEach((key) => {
  overrideByKey[key] = createPlugin({}).extend(({ plugin: { type } }) => ({
    deserializeHtml: {
      getNode: getListNode(type),
    },
  }));
});

export const DeserializeDocxPlugin = createPlugin({
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
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
  key: KEY_DESERIALIZE_DOCX,
  overrideByKey: {
    ...overrideByKey,
    img: {
      editor: {
        insertData: {
          query: ({ dataTransfer }) => {
            const data = dataTransfer.getData('text/html');
            const { body } = new DOMParser().parseFromString(data, 'text/html');

            return !isDocxContent(body);
          },
        },
      },
    },
  },
});
