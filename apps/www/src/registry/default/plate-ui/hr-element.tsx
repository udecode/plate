import React from 'react';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

import { cn } from '@/lib/utils';

const HrElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, nodeProps, ...props }, ref) => {
  const { children } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement ref={ref} {...props}>
      <div className="py-6" contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            'h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content',
            selected && focused && 'ring-2 ring-ring ring-offset-2',
            className
          )}
        />
      </div>
      {children}
    </PlateElement>
  );
});
HrElement.displayName = 'HrElement';

export { HrElement };
