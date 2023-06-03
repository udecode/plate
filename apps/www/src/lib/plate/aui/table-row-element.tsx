import React from 'react';
import {
  TableRowElement as TableRowElementPrimitive,
  TableRowElementRootProps,
} from '@udecode/plate-table';

import { cn } from '@/lib/utils';

export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

const TableRowElement = React.forwardRef<
  React.ElementRef<typeof TableRowElementPrimitive.Root>,
  PlateTableRowElementProps
>(({ hideBorder, children, ...props }, ref) => {
  return (
    <TableRowElementPrimitive.Root
      ref={ref}
      className={cn('h-full', hideBorder && 'border-none')}
      {...props}
    >
      {children}
    </TableRowElementPrimitive.Root>
  );
});
TableRowElement.displayName = 'TableRowElement';

export { TableRowElement };
