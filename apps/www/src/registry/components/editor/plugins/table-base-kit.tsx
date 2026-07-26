import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

import {
  TableCellElementStatic,
  TableCellHeaderElementStatic,
  TableElementStatic,
  TableRowElementStatic,
} from '@/registry/ui/table-node-static';

export const BaseTableKit = [
  BaseTablePlugin.configure({ component: TableElementStatic }),
  BaseTableRowPlugin.configure({
    component: TableRowElementStatic,
  }),
  BaseTableCellPlugin.configure({
    component: TableCellElementStatic,
  }),
  BaseTableCellHeaderPlugin.configure({
    component: TableCellHeaderElementStatic,
  }),
];
