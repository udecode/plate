import {
  createSlatePlugin,
  findHtmlParentElement,
} from '@udecode/plate-common';

/** Enables support for code formatting */
export const CodePlugin = createSlatePlugin({
  isLeaf: true,
  key: 'code',
  parsers: {
    html: {
      deserializer: {
        query({ element }) {
          const blockAbove = findHtmlParentElement(element, 'P');

          if (blockAbove?.style.fontFamily === 'Consolas') return false;

          return !findHtmlParentElement(element, 'PRE');
        },
        rules: [
          { validNodeName: ['CODE'] },
          { validStyle: { fontFamily: 'Consolas' } },
        ],
      },
    },
  },
});
