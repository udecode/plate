import React from 'react';
import {
  TableElement as TableElementPrimitive,
  TableElementRootProps,
  useTableElementState,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';
import { TablePopover } from './TablePopover';

// REVIEWW

const TableElement = React.forwardRef<
  React.ElementRef<typeof TablePopover>,
  TableElementRootProps
>(({ className, children, ...props }, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();

  return (
    <TablePopover ref={ref}>
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
    </TablePopover>
  );
});
TableElement.displayName = 'TableElement';

export { TableElement };
