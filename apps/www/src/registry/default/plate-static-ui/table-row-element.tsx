import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function TableRowStaticElement({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  // const { hideBorder } = element as TTableRowElement;

  return (
    <PlateStaticElement
      as="tr"
      className={cn('h-full', className)}
      element={element}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
}
