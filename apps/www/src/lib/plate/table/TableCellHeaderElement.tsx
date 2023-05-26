import React from 'react';
import { TableCellElement, TableCellElementProps } from './TableCellElement';

export function TableCellHeaderElement(props: TableCellElementProps) {
  return <TableCellElement {...props} isHeader />;
}
