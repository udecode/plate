import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

const BlockquoteElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps
>(({ className, children, ...props }, ref) => {
  return (
    <PlateElement
      asChild
      ref={ref}
      className={cn(
        'mx-0 my-2 border-l-2 py-2.5 pl-4 pr-5',
        'border-[#ddd] text-[#aaa]',
        className
      )}
      {...props}
    >
      <blockquote>{children}</blockquote>
    </PlateElement>
  );
});
BlockquoteElement.displayName = 'BlockquoteElement';

export { BlockquoteElement };
