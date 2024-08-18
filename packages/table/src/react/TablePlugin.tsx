import { extendPlatePlugin } from '@udecode/plate-common/react';

import {
  TableCellHeaderPlugin as BaseTableCellHeaderPlugin,
  TableCellPlugin as BaseTableCellPlugin,
  TablePlugin as BaseTablePlugin,
  TableRowPlugin,
} from '../lib/TablePlugin';
import { onKeyDownTable } from './onKeyDownTable';

export const TableCellPlugin = extendPlatePlugin(BaseTableCellPlugin, {
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
});

export const TableCellHeaderPlugin = extendPlatePlugin(
  BaseTableCellHeaderPlugin,
  {
    props: ({ element }) => ({
      nodeProps: {
        colSpan: (element?.attributes as any)?.colspan,
        rowSpan: (element?.attributes as any)?.rowspan,
      },
    }),
  }
);

/** Enables support for tables with React-specific features. */
export const TablePlugin = extendPlatePlugin(BaseTablePlugin, {
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
});
