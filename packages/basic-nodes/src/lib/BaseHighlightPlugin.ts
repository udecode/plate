import { createSlatePlugin, KEYS } from '@udecode/plate';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = createSlatePlugin({
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
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
