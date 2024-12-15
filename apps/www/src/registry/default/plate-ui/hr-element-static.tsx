import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export function HrElementStatic({
  children,
  className,
  nodeProps,
  ...props
}: PlateElementStaticProps) {
  return (
    <PlateElementStatic className={className} {...props}>
      <div className="py-6" contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            'h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {children}
    </PlateElementStatic>
  );
}
