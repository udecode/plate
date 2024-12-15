import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export function TableRowElementStatic({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) {
  // const { hideBorder } = element as TTableRowElement;

  return (
    <PlateElementStatic
      as="tr"
      className={cn('h-full', className)}
      element={element}
      {...props}
    >
      {children}
    </PlateElementStatic>
  );
}
