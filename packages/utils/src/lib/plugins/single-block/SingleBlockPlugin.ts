import { createSlatePlugin } from '@platejs/core';

import { KEYS } from '../../plate-keys';

/** Forces editor to only have one block. */
export const SingleBlockPlugin = createSlatePlugin({
  key: KEYS.singleBlock,
  override: {
    enabled: {
      [KEYS.trailingBlock]: false,
    },
  },
}).overrideEditor(({ editor, tf: { normalizeNode } }) => ({
  transforms: {
    insertBreak() {
      editor.tf.insertSoftBreak();
    },

    normalizeNode(entry) {
      const [_node, path] = entry;

      if (path.length === 0 && editor.children.length > 1) {
        editor.tf.withoutNormalizing(() => {
          // Merge all subsequent blocks into the first block
          while (editor.children.length > 1) {
            editor.tf.insertText('\n', { at: editor.api.start([1]) });
            editor.tf.mergeNodes({
              at: [1],
              match: (_, path) => path.length === 1,
            });
          }
        });

        return;
      }

      normalizeNode(entry);
    },
  },
}));
