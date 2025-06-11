import { createSlatePlugin, KEYS } from 'platejs';

/** Enables support for superscript formatting. */
export const BaseSuperscriptPlugin = createSlatePlugin({
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
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type, {
      remove: editor.getType(KEYS.sub),
    });
  },
}));
