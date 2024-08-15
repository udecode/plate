import {
  type HotkeyPluginOptions,
  type PluginConfig,
  createPlugin,
  createTPlugin,
} from '@udecode/plate-common';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export type ColumnConfig = PluginConfig<'column_group', HotkeyPluginOptions>;

export const ColumnItemPlugin = createPlugin({
  isElement: true,
  key: 'column',
  withOverrides: withColumn,
});

export const ColumnPlugin = createTPlugin<ColumnConfig>({
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  isElement: true,
  key: 'column_group',
  options: {},
  plugins: [ColumnItemPlugin],
});
