import { toPlatePlugin } from '@udecode/plate-common/react';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../lib';
import { onKeyDownColumn } from './onKeyDownColumn';

export const ColumnItemPlugin = toPlatePlugin(BaseColumnItemPlugin);

/** Enables support for columns with React-specific features. */
export const ColumnPlugin = toPlatePlugin(BaseColumnPlugin, {
  plugins: [ColumnItemPlugin],
  handlers: {
    onKeyDown: onKeyDownColumn,
  },
});
