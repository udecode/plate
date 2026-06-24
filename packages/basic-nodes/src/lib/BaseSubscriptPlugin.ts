import { createEditorPlugin, KEYS } from 'platejs';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createEditorPlugin({
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
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.remove(KEYS.sup);
    tx.marks.toggle(type);
  },
}));
