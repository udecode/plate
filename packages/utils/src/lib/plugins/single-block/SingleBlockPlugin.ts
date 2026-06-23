import {
  createEditorPlugin,
  type PluginConfig,
  type EditorPlugin,
} from '@platejs/core';

import { KEYS } from '../../plate-keys';

export type SingleBlockConfig = PluginConfig<'singleBlock'>;

/** Forces editor to only have one block. */
export const SingleBlockPlugin: EditorPlugin<SingleBlockConfig> = Object.assign(
  createEditorPlugin({
    key: KEYS.singleBlock,
    override: {
      enabled: {
        [KEYS.trailingBlock]: false,
      },
    },
  }),
  { runtimeSingleBlock: true }
);
