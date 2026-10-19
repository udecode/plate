import { editorCommands, NodeApi } from '../../facade';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { PLUGINS } from '../plate-keys';
import { joinNextRootBlock } from './joinSingleRootBlock.internal';

const LINE_BREAK = /[\r\n\u2028\u2029]/g;

/** Forces editor to only have one line. */
export const SingleLinePlugin = definePlugin(PLUGINS.singleLine, {
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
        joinNextRootBlock(tx, '', 'SingleLinePlugin');
      },
    },
    {
      event: 'content',
      correct({ entry, tx }) {
        const [node, path] = entry;

        if (NodeApi.isText(node)) {
          const filteredText = node.text.replace(LINE_BREAK, '');

          if (filteredText !== node.text) {
            tx.nodes.replace({ ...node, text: filteredText }, { at: path });
          }
        }
      },
    },
  ],
  override: {
    [PLUGINS.trailingBlock]: {
      enabled: false,
    },
  },
});
