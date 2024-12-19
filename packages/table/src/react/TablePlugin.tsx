import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';
import { onKeyDownTable } from './onKeyDownTable';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin);

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  handlers: {
    onKeyDown: onKeyDownTable,
  },
});
