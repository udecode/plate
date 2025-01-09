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
      <div
        className="cursor-text py-6"
        data-plate-prevent-deserialization
        contentEditable={false}
      >
        <hr
          data-plate-prevent-deserialization
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
