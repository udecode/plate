import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, useElement, withHOC } from '@udecode/plate-common';
import { TLayoutChildElement } from '@udecode/plate-layout';
import { ResizableProvider } from '@udecode/plate-resizable';
import { useReadOnly } from 'slate-react';

export const LayoutChildElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ className, children, ...props }, ref) => {
    const readOnly = useReadOnly();
    const { width } = useElement<TLayoutChildElement>();

    return (
      <PlateElement
        ref={ref}
        style={{ width }}
        className={cn(
          className,
          !readOnly && 'rounded-lg border border-dashed border-slate-300 p-1.5'
        )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  })
);
