import { createSlatePlugin, KEYS, someHtmlElement } from 'platejs';

/** Enables support for bold formatting */
export const BaseBoldPlugin = createSlatePlugin({
  key: KEYS.bold,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['STRONG', 'B'] },
          {
            validStyle: {
              fontWeight: ['600', '700', 'bold'],
            },
          },
        ],
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.fontWeight === 'normal'
          ),
      },
    },
  },
  render: { as: 'strong' },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
