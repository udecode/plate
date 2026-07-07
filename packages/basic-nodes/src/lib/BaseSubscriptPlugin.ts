import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['SUB'] },
          { validStyle: { verticalAlign: 'sub' } },
        ],
      },
    },
  },
  render: { as: 'sub' },
  rules: { selection: { affinity: 'directional' } },
}).extendTx(({ editor, type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type, true, {
      clear: editor.getType(KEYS.sup),
    });
  },
}));
