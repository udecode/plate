'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { useComposedRef } from '@udecode/plate-common';
import { useColorInput } from '@udecode/plate-font';

export const ColorInput = withRef<'input'>(
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
          className={cn('size-0 overflow-hidden border-0 p-0', className)}
          type="color"
          value={value}
          {...props}
        />
      </div>
    );
  }
);
