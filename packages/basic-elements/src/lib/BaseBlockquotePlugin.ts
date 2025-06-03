import { type TElement, createSlatePlugin, KEYS } from '@udecode/plate';

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  key: KEYS.blockquote,
  node: { isElement: true },
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
})
  .overrideEditor(({ api: { shouldMergeNodesRemovePrevNode } }) => ({
    api: {
      shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry) {
        const prevNode = prevNodeEntry[0] as TElement;

        if (prevNode.type === KEYS.blockquote) return false;

        return shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry);
      },
    },
  }))
  .extendTransforms(({ editor, type }) => ({
    toggle: () => {
      editor.tf.toggleBlock(type);
    },
  }));
