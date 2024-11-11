'use client';

import React from 'react';

import { cn, withProps, withRef } from '@udecode/cn';
import {
  useTableCellElement,
  useTableCellElementResizable,
  useTableCellElementState,
} from '@udecode/plate-table/react';

import { PlateElement } from './plate-element';

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    hideBorder?: boolean;
    isHeader?: boolean;
  }
>(({ children, className, hideBorder, isHeader, style, ...props }, ref) => {
  const { element } = props;

  const { borders, isFirstCell, readOnly, selected } =
    useTableCellElementState();
  const { props: cellProps } = useTableCellElement({ element: props.element });

  const { bottomProps, leftProps, rightProps } = useTableCellElementResizable();

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      className={cn(
        'relative h-full overflow-visible border-none bg-background p-0',
        hideBorder && 'before:border-none',
        element.background ? 'bg-[--cellBackground]' : 'bg-background',
        !hideBorder &&
          cn(
            isHeader && 'text-left [&_>_*]:m-0',
            'before:size-full',
            selected && 'before:z-10 before:bg-muted',
            "before:absolute before:box-border before:select-none before:content-['']",
            borders &&
              cn(
                borders.bottom?.size &&
                  `before:border-b before:border-b-border`,
                borders.right?.size && `before:border-r before:border-r-border`,
                borders.left?.size && `before:border-l before:border-l-border`,
                borders.top?.size && `before:border-t before:border-t-border`
              )
          ),
        className
      )}
      {...cellProps}
      {...props}
      style={
        {
          '--cellBackground': element.background,
          ...style,
        } as React.CSSProperties
      }
    >
      <div className="relative z-20 box-border h-full px-3 py-2">
        {children}
      </div>

      {!readOnly && (
        <div
          className="group absolute top-0 size-full select-none"
          contentEditable={false}
          suppressContentEditableWarning={true}
        >
          {isFirstCell && (
            <div
              className="absolute left-[-2px] z-30 h-full w-1 cursor-col-resize bg-transparent"
              {...leftProps}
            />
          )}
          <div
            className="absolute right-[-2px] z-30 h-full w-1 cursor-col-resize bg-transparent"
            {...rightProps}
          />
          <div
            className="absolute bottom-[-2px] z-30 h-1 w-full cursor-row-resize bg-transparent"
            {...bottomProps}
          />
        </div>
      )}
    </PlateElement>
  );
});

TableCellElement.displayName = 'TableCellElement';

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
