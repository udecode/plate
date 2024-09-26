import React from 'react';

import type { TColumnElement } from '@udecode/plate-layout';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, useElement, withHOC } from '@udecode/plate-common/react';
import { ResizableProvider } from '@udecode/plate-resizable';
import { useReadOnly } from 'slate-react';

export const ColumnElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const { width } = useElement<TColumnElement>();

    return (
      <PlateElement
        ref={ref}
        className={cn(
          className,
          !readOnly && 'rounded-lg border border-dashed p-1.5'
        )}
        style={{ width }}
        {...props}
      >
        {children}
      </PlateElement>
    );
  })
);
