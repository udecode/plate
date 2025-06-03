import { createSlatePlugin, findHtmlParentElement, KEYS } from '@udecode/plate';

/** Enables support for code formatting */
export const BaseCodePlugin = createSlatePlugin({
  key: KEYS.code,
  node: { inset: true, isHardEdge: true, isLeaf: true },
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
  render: { as: 'code' },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
