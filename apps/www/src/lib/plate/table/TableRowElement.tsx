import React from 'react';
import {
  TableRowElement as TableRowElementPrimitive,
  TableRowElementRootProps,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';

export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

export function TableRowElement(props: PlateTableRowElementProps) {
  const { children, hideBorder, ...rootProps } = props;

  return (
    <TableRowElementPrimitive.Root
      className={cn('h-full', hideBorder && 'border-none')}
      {...rootProps}
    >
      {children}
    </TableRowElementPrimitive.Root>
  );
}
