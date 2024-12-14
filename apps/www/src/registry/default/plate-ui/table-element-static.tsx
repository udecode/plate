import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';
import type { TTableElement } from '@udecode/plate-table';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export const TableElementStatic = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  const { colSizes } = element as TTableElement;

  return (
    <PlateStaticElement
      className={cn('overflow-x-auto', className)}
      element={element}
      {...props}
    >
      <table
        className={cn(
          'my-4 ml-px mr-0 table h-px w-[calc(100%-6px)] table-fixed border-collapse'
        )}
      >
        <colgroup>
          {colSizes?.map((width, index) => (
            <col
              key={index}
              style={{
                width: width || undefined,
              }}
            />
          ))}
        </colgroup>

        <tbody className="min-w-full">{children}</tbody>
      </table>
    </PlateStaticElement>
  );
};
