'use client';

import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';

import {
  TableCellElement,
  TableCellHeaderElement,
  TableElement,
  TableRowElement,
} from '@/registry/ui/table-node';

import { NodeIdKit } from './node-id-kit';

export const TableKit = [
  ...NodeIdKit,
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),
];
