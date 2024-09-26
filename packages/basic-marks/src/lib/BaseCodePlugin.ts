import {
  createSlatePlugin,
  findHtmlParentElement,
} from '@udecode/plate-common';

/** Enables support for code formatting */
export const BaseCodePlugin = createSlatePlugin({
  key: 'code',
  node: { isLeaf: true },
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
