import React from 'react';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

const ParagraphElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, children, ...props }: PlateElementProps, ref) => {
  return (
    <PlateElement
      ref={ref}
      className={cn('m-0 px-0 py-1', className)}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
ParagraphElement.displayName = 'ParagraphElement';

export { ParagraphElement };
