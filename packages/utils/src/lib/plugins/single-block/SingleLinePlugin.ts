import { createBasePlugin } from '@platejs/core';
import { NodeApi } from '@platejs/plite';

import { KEYS } from '../../plate-keys';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createBasePlugin({
  key: KEYS.singleLine,
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
        const secondText = NodeApi.string(children[1]);

        if (secondText.length === 0) {
          tx.nodes.remove({ at: [1] });
          return;
        }

        tx.nodes.merge({
          at: [1],
          match: (_, path) => path.length === 1,
        });
        return;
      }

      next();
    },
    node({ entry, next, tx }) {
      const [node, path] = entry;

      if (NodeApi.isText(node)) {
        const filteredText = node.text.replace(/[\r\n\u2028\u2029]/g, '');

        if (filteredText !== node.text) {
          tx.text.delete({
            at: {
              anchor: { offset: 0, path },
              focus: { offset: node.text.length, path },
            },
          });

          if (filteredText.length > 0) {
            tx.text.insert(filteredText, { at: { offset: 0, path } });
          }
          return;
        }
      }

      next();
    },
  },
  transforms: {
    insertBreak() {
      return true;
    },
    insertSoftBreak() {
      return true;
    },
  },
}));
