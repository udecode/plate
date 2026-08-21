import { defineBasePlugin } from '@platejs/core';
import { editorCommands, NodeApi } from '@platejs/plite';

import { PLUGINS } from '../plate-keys';

/** Forces editor to only have one block. */
export const SingleBlockPlugin = defineBasePlugin(PLUGINS.singleBlock, {
  commands: ({ handle }) => [
    handle(editorCommands.insertBreak, ({ state }) =>
      state.transaction((tx) => {
        tx.break.insertSoft();
      })
    ),
  ],
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ tx }) {
        const children = tx.nodes.children();

        if (children.length > 1) {
          const secondNode = children[1];
          const secondText = NodeApi.string(secondNode);
          const [lastNode, relativePath] = NodeApi.last(children[0], []);

          if (!NodeApi.isText(lastNode)) {
            return;
          }
          const firstBlockEnd = {
            offset: lastNode.text.length,
            path: [0, ...relativePath],
          };

          if (secondText.length === 0) {
            tx.nodes.remove({ at: [1] });
          } else {
            tx.nodes.merge({
              at: [1],
              match: (_, path) => path.length === 1,
            });
          }
          tx.text.insert('\n', { at: firstBlockEnd });
        }
      },
    },
  ],
  override: {
    plugins: {
      [PLUGINS.trailingBlock]: {
        enabled: false,
      },
    },
  },
});
