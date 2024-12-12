import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function HrStaticElement({
  children,
  className,
  nodeProps,
  ...props
}: StaticElementProps) {
  return (
    <PlateStaticElement className={className} {...props}>
      <div className="py-6" contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            'h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {children}
    </PlateStaticElement>
  );
}
