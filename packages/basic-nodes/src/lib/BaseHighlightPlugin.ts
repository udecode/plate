import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = createBasePlugin({
  key: KEYS.highlight,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: ['MARK'],
          },
        ],
      },
    },
  },
  render: { as: 'mark' },
  rules: { selection: { affinity: 'directional' } },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
