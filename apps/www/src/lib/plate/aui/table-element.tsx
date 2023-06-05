import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps } from '@udecode/plate-common';
import { useTableElement, useTableElementState } from '@udecode/plate-table';
import { TableFloatingToolbar } from './table-floating-toolbar';

import { cn } from '@/lib/utils';

const TableElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, children, ...props }, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();
  const { props: tableProps, colGroupProps } = useTableElement();

  return (
    <TableFloatingToolbar>
      <div style={{ paddingLeft: marginLeft }}>
        <PlateElement
          asChild
          ref={ref}
          className={cn(
            'my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse',
            isSelectingCell && '[&_*::selection]:bg-none',
            className
          )}
          {...tableProps}
          {...props}
        >
          <table>
            <colgroup {...colGroupProps}>
              {colSizes.map((width, index) => (
                <col
                  key={index}
                  style={{
                    minWidth: minColumnWidth,
                    width: width || undefined,
                  }}
                />
              ))}
            </colgroup>

            <tbody className="min-w-full">{children}</tbody>
          </table>
        </PlateElement>
      </div>
    </TableFloatingToolbar>
  );
});
TableElement.displayName = 'TableElement';

export { TableElement };
