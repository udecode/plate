import {
  type HotkeyPluginOptions,
  createPlugin,
} from '@udecode/plate-common';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export const ColumnItemPlugin = createPlugin({
  isElement: true,
  key: 'column',
  withOverrides: withColumn,
});

export const ColumnPlugin = createPlugin<'column_group', HotkeyPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  isElement: true,
  key: 'column_group',
  options: {},
  plugins: [ColumnItemPlugin],
});
