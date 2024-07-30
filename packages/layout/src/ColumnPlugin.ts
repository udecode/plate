import {
  type HotkeyPluginOptions,
  createPlugin,
} from '@udecode/plate-common/server';

import { onKeyDownColumn } from './onKeyDownColumn';
import { withColumn } from './withColumn';

export const ELEMENT_COLUMN_GROUP = 'column_group';

export const ELEMENT_COLUMN = 'column';

export const ColumnItemPlugin = createPlugin({
  isElement: true,
  key: ELEMENT_COLUMN,
  withOverrides: withColumn,
});

export const ColumnPlugin = createPlugin<HotkeyPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  isElement: true,
  key: ELEMENT_COLUMN_GROUP,
  options: {},
  plugins: [ColumnItemPlugin],
});
