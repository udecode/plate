import React from 'react';
import {
  TableElement as TableElementPrimitive,
  TableElementRootProps,
  useTableElementState,
} from '@udecode/plate-table';
import { TableFloatingToolbar } from './table-floating-toolbar';

import { cn } from '@/lib/utils';

// REVIEWW

const TableElement = React.forwardRef<
  React.ElementRef<typeof TableFloatingToolbar>,
  TableElementRootProps
>(({ className, children, ...props }, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();

  return (
    <TableFloatingToolbar ref={ref}>
      <TableElementPrimitive.Wrapper style={{ paddingLeft: marginLeft }}>
        <TableElementPrimitive.Root
          className={cn(
            'my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse',
            isSelectingCell && '[&_*::selection]:bg-none',
            className
          )}
          {...props}
        >
          <TableElementPrimitive.ColGroup>
            {colSizes.map((width, index) => (
              <TableElementPrimitive.Col
                key={index}
                style={{
                  minWidth: minColumnWidth,
                  width: width || undefined,
                }}
              />
            ))}
          </TableElementPrimitive.ColGroup>

          <TableElementPrimitive.TBody className="min-w-full">
            {children}
          </TableElementPrimitive.TBody>
        </TableElementPrimitive.Root>
      </TableElementPrimitive.Wrapper>
    </TableFloatingToolbar>
  );
});
TableElement.displayName = 'TableElement';

export { TableElement };
