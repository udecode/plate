import {
  createSlatePlugin,
  type PluginConfig,
  type SlatePlugin,
} from '@platejs/core';

import { KEYS } from '../../plate-keys';

export type SingleBlockConfig = PluginConfig<'singleBlock'>;

/** Forces editor to only have one block. */
export const SingleBlockPlugin: SlatePlugin<SingleBlockConfig> = Object.assign(
  createSlatePlugin({
    key: KEYS.singleBlock,
    override: {
      enabled: {
        [KEYS.trailingBlock]: false,
      },
    },
  }),
  { runtimeSingleBlock: true }
);
