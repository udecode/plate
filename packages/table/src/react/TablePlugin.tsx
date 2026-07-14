import { toPlatePlugin } from '@platejs/core/react';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';
import { withSetFragmentDataTable } from '../lib/withSetFragmentDataTable';
import { onKeyDownTable } from './onKeyDownTable';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin);

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  handlers: {
    onCopy: ({ editor, event }) => {
      if (!withSetFragmentDataTable(editor, event.clipboardData)) return;

      event.preventDefault();
      return true;
    },
    onCut: ({ editor, event }) => {
      if (!withSetFragmentDataTable(editor, event.clipboardData)) return;

      event.preventDefault();
      editor.update.fragment.delete();
      return true;
    },
    onKeyDown: (ctx) => onKeyDownTable(ctx),
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
});
