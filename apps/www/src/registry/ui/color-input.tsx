'use client';

import * as React from 'react';

import { useColorInput } from '@udecode/plate-font/react';
import { useComposedRef } from '@udecode/plate/react';

import { cn } from '@/lib/utils';

export function ColorInput({
  children,
  className,
  value = '#000000',
  ...props
}: React.ComponentProps<'input'>) {
  const { childProps, inputRef } = useColorInput();

  return (
    <div className="flex flex-col items-center">
      {React.Children.map(children, (child) => {
        if (!child) return child;

        return React.cloneElement(child as React.ReactElement, childProps);
      })}
      <input
        {...props}
        ref={useComposedRef(props.ref, inputRef)}
        className={cn('size-0 overflow-hidden border-0 p-0', className)}
        value={value}
        type="color"
      />
    </div>
  );
}
