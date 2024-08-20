import type { HotkeyPluginOptions, PluginConfig } from '@udecode/plate-common';

import { toPlatePlugin, toTPlatePlugin } from '@udecode/plate-common/react';

import {
  ColumnItemPlugin as BaseColumnItemPlugin,
  ColumnPlugin as BaseColumnPlugin,
} from '../lib';
import { onKeyDownColumn } from './onKeyDownColumn';

export type ColumnConfig = PluginConfig<'column_group', HotkeyPluginOptions>;

export const ColumnItemPlugin = toPlatePlugin(BaseColumnItemPlugin);

/** Enables support for columns with React-specific features. */
export const ColumnPlugin = toTPlatePlugin<ColumnConfig>(BaseColumnPlugin, {
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
  plugins: [ColumnItemPlugin],
});
