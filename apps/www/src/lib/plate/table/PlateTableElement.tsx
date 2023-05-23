import React from 'react';
import {
  TableElement,
  TableElementRootProps,
  useTableElementState,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';
import { TableDropdownMenu } from './TableDropdownMenu';

export function PlateTableElement({
  className,
  children,
  ...props
}: TableElementRootProps) {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();

  return (
    <TableDropdownMenu>
      <TableElement.Wrapper style={{ paddingLeft: marginLeft }}>
        <TableElement.Root
          className={cn(
            'my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse',
            isSelectingCell && '[&_*::selection]:bg-none',
            className
          )}
          {...props}
        >
          <TableElement.ColGroup>
            {colSizes.map((width, index) => (
              <TableElement.Col
                key={index}
                style={{
                  minWidth: minColumnWidth,
                  width: width || undefined,
                }}
              />
            ))}
          </TableElement.ColGroup>

          <TableElement.TBody className="min-w-full">
            {children}
          </TableElement.TBody>
        </TableElement.Root>
      </TableElement.Wrapper>
    </TableDropdownMenu>
  );
}
