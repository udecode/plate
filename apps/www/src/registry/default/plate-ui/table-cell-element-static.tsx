import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import {
  PlateElementStatic,
  findNode,
  getParentNode,
  isElement,
} from '@udecode/plate-common';
import { getTableCellBorders } from '@udecode/plate-table';

export function TableCellElementStatic({
  children,
  className,
  isHeader,
  style,
  ...props
}: PlateElementStaticProps & {
  isHeader?: boolean;
}) {
  const { editor, element } = props;

  const cellPath = findNode(editor!, {
    match: (n) => isElement(n) && n === element,
  })![1];

  const rowPath = getParentNode(editor!, cellPath)![1];

  const borders = getTableCellBorders(element, {
    isFirstCell: cellPath.at(-1) === 0,
    isFirstRow: rowPath.at(-1) === 0,
  });

  return (
    <PlateElementStatic
      as={isHeader ? 'th' : 'td'}
      className={cn(
        'relative h-full overflow-visible bg-background p-0',
        element.background ? 'bg-[--cellBackground]' : 'bg-background',
        cn(
          isHeader && 'text-left font-normal [&_>_*]:m-0',
          'before:size-full',
          "before:absolute before:box-border before:select-none before:content-['']",
          borders &&
            cn(
              borders.bottom?.size && `before:border-b before:border-b-border`,
              borders.right?.size && `before:border-r before:border-r-border`,
              borders.left?.size && `before:border-l before:border-l-border`,
              borders.top?.size && `before:border-t before:border-t-border`
            )
        ),
        className
      )}
      style={
        {
          '--cellBackground': element.background,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="relative z-20 box-border h-full px-3 py-2">
        {children}
      </div>
    </PlateElementStatic>
  );
}

export function TableCellHeaderStaticElement(props: PlateElementStaticProps) {
  return <TableCellElementStatic {...props} isHeader />;
}
