import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps, TElement, Value } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

import { cn } from '@/lib/utils';

// REVIEWW
const HrElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TElement>
>(({ className, nodeProps, ...props }, ref) => {
  const { children } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement ref={ref} {...props}>
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
});
HrElement.displayName = 'HrElement';

export { HrElement };
