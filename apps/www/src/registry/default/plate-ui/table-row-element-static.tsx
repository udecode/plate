import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export function TableRowElementStatic({
  children,
  className,
  element,
  ...props
}: SlateElementProps) {
  // const { hideBorder } = element as TTableRowElement;

  return (
    <SlateElement
      as="tr"
      className={cn('h-full', className)}
      element={element}
      {...props}
    >
      {children}
    </SlateElement>
  );
}
