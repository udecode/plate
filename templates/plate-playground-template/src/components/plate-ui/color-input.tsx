'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { useComposedRef } from '@udecode/plate-common/react';
import { useColorInput } from '@udecode/plate-font/react';

export const ColorInput = withRef<'input'>(
  ({ children, className, value = '#000000', ...props }, ref) => {
    const { childProps, inputRef } = useColorInput();

    return (
      <div className="flex flex-col items-center">
        {React.Children.map(children, (child) => {
          if (!child) return child;

          return React.cloneElement(child as React.ReactElement, childProps);
        })}

        <input
          className={cn('size-0 overflow-hidden border-0 p-0', className)}
          ref={useComposedRef(ref, inputRef)}
          type="color"
          value={value}
          {...props}
        />
      </div>
    );
  }
);
