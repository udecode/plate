import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for code formatting */
export const BaseKbdPlugin = createBasePlugin({
  key: KEYS.kbd,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['KBD'] }],
      },
    },
  },
  render: { as: 'kbd' },
  rules: { selection: { affinity: 'hard' } },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
