import {
  createSlatePlugin,
  type PluginConfig,
  type SlatePlugin,
} from '@platejs/core';

import { KEYS } from '../../plate-keys';

export type SingleLineConfig = PluginConfig<'singleLine'>;

/** Forces editor to only have one line. */
export const SingleLinePlugin: SlatePlugin<SingleLineConfig> = Object.assign(
  createSlatePlugin({
    key: KEYS.singleLine,
    override: {
      enabled: {
        [KEYS.trailingBlock]: false,
      },
    },
  }),
  { runtimeSingleLine: true }
);
