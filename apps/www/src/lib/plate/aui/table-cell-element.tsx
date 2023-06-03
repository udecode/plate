import React from 'react';
import {
  TableCellElement as TableCellElementPrimitive,
  TableCellElementRootProps,
  useTableCellElementState,
} from '@udecode/plate-table';

import { cn } from '@/lib/utils';

// REVIEWW
export interface TableCellElementProps extends TableCellElementRootProps {
  hideBorder?: boolean;
  isHeader?: boolean;
}

const TableCellElement = React.forwardRef<
  React.ElementRef<typeof TableCellElementPrimitive.Root>,
  TableCellElementProps
>(({ className, ...props }, ref) => {
  const { children, hideBorder, isHeader, ...rootProps } = props;

  const {
    colIndex,
    rowIndex,
    readOnly,
    selected,
    hovered,
    hoveredLeft,
    rowSize,
    borders,
  } = useTableCellElementState();

  return (
    <TableCellElementPrimitive.Root
      ref={ref}
      asAlias={isHeader ? 'th' : 'td'}
      className={cn(
        'relative overflow-visible border-none bg-background p-0',
        hideBorder && 'before:border-none',
        !hideBorder &&
          cn(
            isHeader && 'text-left',
            isHeader && 'before:bg-[rgb(244,245,247)] [&_>_*]:m-0',
            'before:h-full before:w-full',
            selected && 'before:z-10 before:border-blue-500 before:bg-blue-50',
            "before:absolute before:box-border before:select-none before:content-['']",
            borders &&
              cn(
                borders.bottom?.size &&
                  `before:border-b before:border-b-[rgb(209_213_219)]`,
                borders.right?.size &&
                  `before:border-r before:border-r-[rgb(209_213_219)]`,
                borders.left?.size &&
                  `before:border-l before:border-l-[rgb(209_213_219)]`,
                borders.top?.size &&
                  `before:border-t before:border-t-[rgb(209_213_219)]`
              )
          ),
        className
      )}
      {...rootProps}
    >
      <TableCellElementPrimitive.Content
        className="relative z-20 box-border h-full px-3 py-2"
        style={{
          minHeight: rowSize,
        }}
      >
        {children}
      </TableCellElementPrimitive.Content>

      <TableCellElementPrimitive.ResizableWrapper className="group absolute top-0 h-full w-full select-none">
        <TableCellElementPrimitive.Resizable
          colIndex={colIndex}
          rowIndex={rowIndex}
          readOnly={readOnly}
        />

        {!readOnly && hovered && (
          <TableCellElementPrimitive.Handle
            className={cn(
              'absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-blue-500',
              'right-[-1.5px]'
            )}
          />
        )}

        {!readOnly && hoveredLeft && (
          <TableCellElementPrimitive.Handle
            className={cn(
              'absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-blue-500',
              'left-[-1.5px]'
            )}
          />
        )}
      </TableCellElementPrimitive.ResizableWrapper>
    </TableCellElementPrimitive.Root>
  );
});
TableCellElement.displayName = 'TableCellElement';

export { TableCellElement };
