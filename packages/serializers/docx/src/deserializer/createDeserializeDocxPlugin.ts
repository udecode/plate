import {
  createPluginFactory,
  DeserializeHtml,
  KEY_DESERIALIZE_HTML,
  PlatePlugin,
} from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { KEY_INDENT, KEY_TEXT_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE, ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
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
  (element) => {
    const node: any = { type };

    if (isDocxList(element)) {
      node[KEY_INDENT] = getDocxListIndent(element);

      const text = element.textContent ?? '';

      node[KEY_LIST_STYLE_TYPE] =
        getTextListStyleType(text) ?? ListStyleType.Disc;

      element.innerHTML = getDocxListContentHtml(element);
    } else {
      const indent = getDocxIndent(element);
      if (indent) {
        node[KEY_INDENT] = indent;
      }

      const textIndent = getDocxTextIndent(element);
      if (textIndent) {
        node[KEY_TEXT_INDENT] = textIndent;
      }
    }

    return node;
  };

const KEYS = [
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
];

const overrideByKey: Record<string, Partial<PlatePlugin>> = {};

KEYS.forEach((key) => {
  overrideByKey[key] = {
    then: (editor, { type }) => ({
      deserializeHtml: {
        getNode: getListNode(type),
      },
    }),
  };
});

export const createDeserializeDocxPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_DOCX,
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            transformData: (data, { dataTransfer }) => {
              const rtf = dataTransfer.getData('text/rtf');

              return cleanDocx(data, rtf);
            },
          },
        },
      },
    },
  },
  overrideByKey: {
    ...overrideByKey,
    [ELEMENT_IMAGE]: {
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
