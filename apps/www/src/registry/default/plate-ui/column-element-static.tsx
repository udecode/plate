import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';
import type { TColumnElement } from '@udecode/plate-layout';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function ColumnElementStatic({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  const { width } = element as TColumnElement;

  return (
    <PlateStaticElement
      className={cn('rounded-lg border border-dashed p-1.5', className)}
      style={{ width: width ?? '100%' }}
      element={element}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
}
