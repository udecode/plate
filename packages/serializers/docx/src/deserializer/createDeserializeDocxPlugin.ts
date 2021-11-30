import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import {
  deserializeHtmlCodeBlock,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate-code-block';
import {
  createPluginFactory,
  DeserializeHtml,
  KEY_DESERIALIZE_HTML,
} from '@udecode/plate-core';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { ELEMENT_IMAGE } from '@udecode/plate-image';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE, ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { KEY_ALIGN } from '../../../../elements/alignment/src/createAlignPlugin';
import { cleanDocx } from '../docx-cleaner/cleanDocx';
import { getDocxIndent } from '../docx-cleaner/utils/getDocxIndent';
import { getDocxListContentHtml } from '../docx-cleaner/utils/getDocxListContentHtml';
import { getDocxListIndent } from '../docx-cleaner/utils/getDocxListIndent';
import { getTextListStyleType } from '../docx-cleaner/utils/getTextListStyleType';
import { isDocxContent } from '../docx-cleaner/utils/isDocxContent';
import { isDocxList } from '../docx-cleaner/utils/isDocxList';

export const KEY_DESERIALIZE_DOCX = 'deserializeDocx';

const getListNode = (type: string): DeserializeHtml['getNode'] => (element) => {
  const node = { type };

  if (element.style.textAlign) {
    node[KEY_ALIGN] = element.style.textAlign;
  }

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
  }

  return node;
};

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
    [ELEMENT_PARAGRAPH]: {
      then: (editor, { type }) => ({
        deserializeHtml: {
          query: (el) => {
            return !el.classList.contains('SourceCode');
          },
          getNode: getListNode(type),
        },
      }),
    },
    [ELEMENT_H1]: {
      then: (editor, { type }) => ({
        deserializeHtml: {
          getNode: getListNode(type),
        },
      }),
    },
    [ELEMENT_H2]: {
      then: (editor, { type }) => ({
        deserializeHtml: {
          getNode: getListNode(type),
        },
      }),
    },
    [ELEMENT_H3]: {
      then: (editor, { type }) => ({
        deserializeHtml: {
          getNode: getListNode(type),
        },
      }),
    },
    [ELEMENT_CODE_BLOCK]: {
      deserializeHtml: [
        {
          validNodeName: 'PRE',
          ...deserializeHtmlCodeBlock,
        },
        {
          validClassName: 'SourceCode',
          ...deserializeHtmlCodeBlock,
        },
      ],
    },
    // [ELEMENT_TABLE]: {
    //   deserializeHtml:
    // },
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
    [MARK_BOLD]: {
      deserializeHtml: [
        {
          validNodeName: ['STRONG', 'B'],
          query: (el) => {
            return !(
              (el.children[0] as HTMLElement)?.style.fontWeight === 'normal'
            );
          },
        },
        {
          validStyle: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
    },
    [MARK_ITALIC]: {
      deserializeHtml: [
        {
          validNodeName: ['EM', 'I'],
          query: (el) => {
            return !(
              el.nodeName === 'EM' &&
              (el.children[0] as HTMLElement)?.style.fontStyle === 'normal'
            );
          },
        },
        {
          validStyle: {
            fontStyle: 'italic',
          },
        },
      ],
    },
  },
});
