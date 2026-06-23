import { createEditorPlugin, findHtmlParentElement, KEYS } from 'platejs';

/** Enables support for code formatting */
export const BaseCodePlugin = createEditorPlugin({
  key: KEYS.code,
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
  render: { as: 'code' },
  rules: { selection: { affinity: 'hard' } },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
