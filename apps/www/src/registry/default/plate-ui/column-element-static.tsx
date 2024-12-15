import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';
import type { TColumnElement } from '@udecode/plate-layout';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export function ColumnElementStatic({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) {
  const { width } = element as TColumnElement;

  return (
    <PlateElementStatic
      className={cn('rounded-lg border border-dashed p-1.5', className)}
      style={{ width: width ?? '100%' }}
      element={element}
      {...props}
    >
      {children}
    </PlateElementStatic>
  );
}
