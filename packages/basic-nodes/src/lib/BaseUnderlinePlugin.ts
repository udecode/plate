import { createSlatePlugin, KEYS, someHtmlElement } from '@udecode/plate';

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createSlatePlugin({
  key: KEYS.underline,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['U'] },
          { validStyle: { textDecoration: ['underline'] } },
        ],
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          ),
      },
    },
  },
  render: { as: 'u' },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
