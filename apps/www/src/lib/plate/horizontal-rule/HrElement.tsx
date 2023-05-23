import React from 'react';
import { TElement, Value } from '@udecode/plate-common';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { useFocused, useSelected } from 'slate-react';

export function HrElement({
  className,
  ...props
}: PlateElementProps<Value, TElement>) {
  const { children, nodeProps } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement {...props}>
      <hr
        contentEditable={false}
        {...nodeProps}
        className={cn(
          'my-6 box-content h-0.5 cursor-pointer border-none bg-gray-200 bg-clip-content py-1',
          'rounded-[1px]',
          selected && focused && 'bg-blue-500',
          className
        )}
      />
      {children}
    </PlateElement>
  );
}
