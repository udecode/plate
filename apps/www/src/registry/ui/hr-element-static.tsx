import React from 'react';

import type { SlateElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate';

export function HrElementStatic({
  children,
  className,
  nodeProps,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={className} nodeProps={nodeProps} {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {children}
    </SlateElement>
  );
}
