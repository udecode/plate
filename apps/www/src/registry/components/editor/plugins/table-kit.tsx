'use client';

import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@platejs/table/react';

import {
  TableCellElement,
  TableCellHeaderElement,
  TableElement,
  TableRowElement,
} from '@/registry/ui/table-node';

export const TableKit = [
  TablePlugin.configure({ component: TableElement }),
  TableRowPlugin.configure({ component: TableRowElement }),
  TableCellPlugin.configure({ component: TableCellElement }),
  TableCellHeaderPlugin.configure({ component: TableCellHeaderElement }),
];
