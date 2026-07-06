import { createBasePlugin } from '@platejs/core';
import { NodeApi } from '@platejs/plite';

import { KEYS } from '../../plate-keys';

/** Forces editor to only have one block. */
export const SingleBlockPlugin = createBasePlugin({
  key: KEYS.singleBlock,
  override: {
    enabled: {
      [KEYS.trailingBlock]: false,
    },
  },
}).extendExtension(({ editor }) => ({
  normalizers: {
    editor({ next, tx }) {
      const children = editor.read.children();

      if (children.length > 1) {
        const secondNode = children[1];
        const secondText = NodeApi.string(secondNode);

        if (secondText.length === 0) {
          const firstBlockEnd = editor.read.points.end([0]);

          if (!firstBlockEnd) {
            next();
            return;
          }

          tx.text.insert('\n', { at: firstBlockEnd });
          tx.nodes.remove({ at: [1] });
          return;
        }

        const secondBlockStart = editor.read.points.start([1]);

        if (!secondBlockStart) {
          next();
          return;
        }

        tx.text.insert('\n', { at: secondBlockStart });
        tx.nodes.merge({
          at: [1],
          match: (_, path) => path.length === 1,
        });
        return;
      }

      next();
    },
  },
  transforms: {
    insertBreak({ tx }) {
      tx.break.insertSoft();
      return true;
    },
  },
}));
