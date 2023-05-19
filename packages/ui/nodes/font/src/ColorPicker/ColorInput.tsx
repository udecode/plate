import React, { ChangeEvent, useRef } from 'react';
import { cn } from '@udecode/plate-styled-components';

export function ColorInput({
  value = '#000000',
  onChange,
  children,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement | null>(null);

  function handleClick() {
    // force click action on the input to open color picker
    ref.current?.click();
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    onChange && onChange(event);
  }

  return (
    <div className={cn('flex flex-col items-center', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!child) return child;

        return React.cloneElement(child as React.ReactElement, {
          onClick: handleClick,
        });
      })}

      <input
        ref={ref}
        type="color"
        onChange={handleOnChange}
        value={value}
        className="h-0 w-0 overflow-hidden border-0 p-0"
      />
    </div>
  );
}
