'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { PlateElement, withRef } from '@udecode/plate/react';

export const ParagraphElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const isAIAnchor = !!props.element?.anchor;

    return (
      <PlateElement
        ref={ref}
        className={cn(className, 'm-0 px-0 py-1', isAIAnchor && 'h-0 overflow-hidden')}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
