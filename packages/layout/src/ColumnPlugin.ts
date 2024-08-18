import {
  type HotkeyPluginOptions,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export type ColumnConfig = PluginConfig<'column_group', HotkeyPluginOptions>;

export const ColumnItemPlugin = createSlatePlugin({
  isElement: true,
  key: 'column',
  withOverrides: withColumn,
});

export const ColumnPlugin = createTSlatePlugin<ColumnConfig>({
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  isElement: true,
  key: 'column_group',
  options: {},
  plugins: [ColumnItemPlugin],
});
