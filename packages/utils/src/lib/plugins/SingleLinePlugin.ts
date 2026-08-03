import { defineBasePlugin } from '@platejs/core';
import { editorCommands, NodeApi } from '@platejs/plite';

import { KEYS } from '../plate-keys';

const LINE_BREAK = /[\r\n\u2028\u2029]/g;

/** Forces editor to only have one line. */
export const SingleLinePlugin = defineBasePlugin(KEYS.singleLine, {
  commands: ({ handle }) => [
    handle(editorCommands.insertBreak, ({ state }) =>
      state.transaction(() => {})
    ),
    handle(editorCommands.insertSoftBreak, ({ state }) =>
      state.transaction(() => {})
    ),
  ],
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ tx }) {
        const children = tx.nodes.children();

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
      },
    },
    {
      event: 'content',
      correct({ entry, tx }) {
        const [node, path] = entry;

        if (NodeApi.isText(node)) {
          const filteredText = node.text.replace(LINE_BREAK, '');

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
      },
    },
  ],
  override: {
    plugins: {
      [KEYS.trailingBlock]: {
        enabled: false,
      },
    },
  },
});
