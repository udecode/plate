import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  TableCellHeaderPlugin as BaseTableCellHeaderPlugin,
  TableCellPlugin as BaseTableCellPlugin,
  TablePlugin as BaseTablePlugin,
  TableRowPlugin as BaseTableRowPlugin,
} from '../lib/TablePlugin';
import { onKeyDownTable } from './onKeyDownTable';
import { withTable } from './withTable';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin, {
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
});

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin, {
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
});

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  withOverrides: withTable,
});
