import { createSlatePlugin, KEYS } from 'platejs';

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  key: KEYS.blockquote,
  node: {
    isElement: true,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'BLOCKQUOTE',
          },
        ],
      },
    },
  },
  render: { as: 'blockquote' },
  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));
