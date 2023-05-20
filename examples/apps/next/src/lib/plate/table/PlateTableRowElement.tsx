import React from 'react';
import {
  TableRowElement,
  TableRowElementRootProps,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';

export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

export function PlateTableRowElement(props: PlateTableRowElementProps) {
  const { children, hideBorder, ...rootProps } = props;

  return (
    <TableRowElement.Root
      className={cn('h-full', hideBorder && 'border-none')}
      {...rootProps}
    >
      {children}
    </TableRowElement.Root>
  );
}
