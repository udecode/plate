import React from 'react';
import { cn } from '@udecode/plate-tailwind';

import { useColorInput } from '@/lib/@/useColorInput';

export function ColorInput({
  value = '#000000',
  onChange,
  children,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { inputRef, childProps } = useColorInput();

  return (
    <div className={cn('flex flex-col items-center', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!child) return child;

        return React.cloneElement(child as React.ReactElement, childProps);
      })}

      <input
        ref={inputRef}
        className="h-0 w-0 overflow-hidden border-0 p-0"
        type="color"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
