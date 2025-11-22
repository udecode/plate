import { createSlatePlugin } from '@platejs/core';

import { TextApi } from '@platejs/slate';
import { KEYS } from '../../plate-keys';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createSlatePlugin({
  key: KEYS.singleLine,
  override: {
    enabled: {
      [KEYS.trailingBlock]: false,
    },
  },
}).overrideEditor(({ editor, tf: { normalizeNode } }) => ({
  transforms: {
    insertBreak() {
      return;
    },

    insertSoftBreak() {
      return;
    },

    normalizeNode(entry) {
      const [node, path] = entry;

      // Filter out line break characters from text nodes
      if (TextApi.isText(node)) {
        const filteredText = node.text.replace(/[\r\n\u2028\u2029]/g, '');
        if (filteredText !== node.text) {
          editor.tf.insertText(filteredText, { at: path });
          return;
        }
      }

      if (path.length === 0 && editor.children.length > 1) {
        editor.tf.withoutNormalizing(() => {
          // Merge all subsequent blocks into the first block
          while (editor.children.length > 1) {
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
