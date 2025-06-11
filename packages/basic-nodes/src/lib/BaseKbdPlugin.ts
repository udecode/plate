import { createSlatePlugin, KEYS } from '@udecode/plate';

/** Enables support for code formatting */
export const BaseKbdPlugin = createSlatePlugin({
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
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
