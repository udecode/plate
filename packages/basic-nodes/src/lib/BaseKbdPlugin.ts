import { createSlatePlugin, KEYS } from '@udecode/plate';

/** Enables support for code formatting */
export const BaseKbdPlugin = createSlatePlugin({
  key: KEYS.kbd,
  node: { inset: true, isHardEdge: true, isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['KBD'] }],
      },
    },
  },
  render: { as: 'kbd' },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
