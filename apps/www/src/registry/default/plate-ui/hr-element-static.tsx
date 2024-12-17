import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export function HrElementStatic({
  children,
  className,
  nodeProps,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={className} {...props}>
      <div className="py-6" contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            'h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {children}
    </SlateElement>
  );
}
