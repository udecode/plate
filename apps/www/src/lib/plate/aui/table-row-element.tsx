import React from 'react';
import {
  TableRowElement as TableRowElementPrimitive,
  TableRowElementRootProps,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';

// REVIEWW
export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

const TableRowElement = React.forwardRef<
  React.ElementRef<typeof TableRowElementPrimitive.Root>,
  PlateTableRowElementProps
>(({ hideBorder, children, ...props }, ref) => {
  return (
    <TableRowElementPrimitive.Root
      className={cn('h-full', hideBorder && 'border-none')}
      {...props}
    >
      {children}
    </TableRowElementPrimitive.Root>
  );
}
