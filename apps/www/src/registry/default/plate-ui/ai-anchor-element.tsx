'use client';
import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';

export const AIAnchorElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement ref={ref} className={cn(className)} {...props}>
        <div className="h-[0.1px]" />
      </PlateElement>
    );
  }
);
