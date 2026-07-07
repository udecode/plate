import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for superscript formatting. */
export const BaseSuperscriptPlugin = createBasePlugin({
  key: KEYS.sup,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['SUP'] },
          { validStyle: { verticalAlign: 'super' } },
        ],
      },
    },
  },
  render: { as: 'sup' },
  rules: { selection: { affinity: 'directional' } },
}).extendTx(({ editor, type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type, true, {
      clear: editor.getType(KEYS.sub),
    });
  },
}));
