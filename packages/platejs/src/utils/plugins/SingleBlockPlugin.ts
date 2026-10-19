import { editorCommands } from '../../facade';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { PLUGINS } from '../plate-keys';
import { joinNextRootBlock } from './joinSingleRootBlock.internal';

/** Forces editor to only have one block. */
export const SingleBlockPlugin = definePlugin(PLUGINS.singleBlock, {
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
        joinNextRootBlock(tx, '\n', 'SingleBlockPlugin');
      },
    },
  ],
  override: {
    [PLUGINS.trailingBlock]: {
      enabled: false,
    },
  },
});
