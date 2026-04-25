import { toPlatePlugin } from 'platejs/react';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';
import { onKeyDownTable } from './onKeyDownTable';
import { onMouseDownTable } from './onMouseDownTable';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin);

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  handlers: {
    onKeyDown: onKeyDownTable,
    onMouseDown: onMouseDownTable,
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
});
