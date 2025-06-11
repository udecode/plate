import { toPlatePlugin } from 'platejs/react';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../lib';

export const ColumnItemPlugin = toPlatePlugin(BaseColumnItemPlugin);

/** Enables support for columns with React-specific features. */
export const ColumnPlugin = toPlatePlugin(BaseColumnPlugin, {
  plugins: [ColumnItemPlugin],
});
