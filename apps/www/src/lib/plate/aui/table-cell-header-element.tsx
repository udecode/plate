import React from 'react';
import { TableCellElement, TableCellElementProps } from './table-cell-element';

const TableCellHeaderElement = React.forwardRef<
  React.ElementRef<typeof TableCellElement>,
  TableCellElementProps
>((props, ref) => {
  return <TableCellElement ref={ref} {...props} isHeader />;
});
TableCellHeaderElement.displayName = 'TableCellHeaderElement';

export { TableCellHeaderElement };
