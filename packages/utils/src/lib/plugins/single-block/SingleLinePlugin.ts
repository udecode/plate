import {
  createEditorPlugin,
  type PluginConfig,
  type EditorPlugin,
} from '@platejs/core';

import { KEYS } from '../../plate-keys';

export type SingleLineConfig = PluginConfig<'singleLine'>;

/** Forces editor to only have one line. */
export const SingleLinePlugin: EditorPlugin<SingleLineConfig> = Object.assign(
  createEditorPlugin({
    key: KEYS.singleLine,
    override: {
      enabled: {
        [KEYS.trailingBlock]: false,
      },
    },
  }),
  { runtimeSingleLine: true }
);
