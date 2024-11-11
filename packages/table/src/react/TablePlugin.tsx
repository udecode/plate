import { toPlatePlugin } from '@udecode/plate-common/react';

import type { TTableRowElement } from '../lib';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';
import { onKeyDownTable } from './onKeyDownTable';
import { withTable } from './withTable';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin, {
  node: {
    props: ({ element }: { element: TTableRowElement }) => ({
      nodeProps: {
        style: {
          height:
            element.size === 0 || !element?.size ? 'auto' : `${element.size}px`,
        },
      },
    }),
  },
});

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin, {
  node: {
    props: ({ element }) => ({
      nodeProps: {
        colSpan: (element?.attributes as any)?.colspan,
        rowSpan: (element?.attributes as any)?.rowspan,
      },
    }),
  },
});

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin, {
  node: {
    props: ({ element }) => ({
      nodeProps: {
        colSpan: (element?.attributes as any)?.colspan,
        rowSpan: (element?.attributes as any)?.rowspan,
      },
    }),
  },
});

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  extendEditor: withTable,
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  handlers: {
    onKeyDown: onKeyDownTable,
  },
});
