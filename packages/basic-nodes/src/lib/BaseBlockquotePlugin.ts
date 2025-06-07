import { createSlatePlugin, KEYS } from '@udecode/plate';

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  key: KEYS.blockquote,
  node: {
    breakRules: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    deleteRules: {
      start: 'reset',
    },
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
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleBlock(type);
  },
}));
