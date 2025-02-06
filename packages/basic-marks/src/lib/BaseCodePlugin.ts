import { createSlatePlugin, findHtmlParentElement } from '@udecode/plate';

/** Enables support for code formatting */
export const BaseCodePlugin = createSlatePlugin({
  key: 'code',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['CODE'] },
          { validStyle: { fontFamily: 'Consolas' } },
        ],
        query({ element }) {
          const blockAbove = findHtmlParentElement(element, 'P');

          if (blockAbove?.style.fontFamily === 'Consolas') return false;

          return !findHtmlParentElement(element, 'PRE');
        },
      },
    },
  },
});
