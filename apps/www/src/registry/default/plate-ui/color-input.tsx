'use client';

import React from 'react';
import { useComposedRef } from '@udecode/plate-common';
import { useColorInput } from '@udecode/plate-font';

import { cn, withElementRef } from '@/lib/utils';

export const ColorInput = withElementRef(
  'input',
  ({ value = '#000000', children, className, ...props }, ref) => {
    const { inputRef, childProps } = useColorInput();

    return (
      <div className="flex flex-col items-center">
        {React.Children.map(children, (child) => {
          if (!child) return child;

          return React.cloneElement(child as React.ReactElement, childProps);
        })}

        <input
          ref={useComposedRef(ref, inputRef)}
          className={cn('h-0 w-0 overflow-hidden border-0 p-0', className)}
          type="color"
          value={value}
          {...props}
        />
      </div>
    );
  }
);
