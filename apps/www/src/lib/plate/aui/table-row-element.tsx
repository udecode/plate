import React from 'react';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export interface PlateTableRowElementProps extends PlateElementProps {
  hideBorder?: boolean;
}

const TableRowElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateTableRowElementProps
>(({ hideBorder, children, ...props }, ref) => {
  return (
    <PlateElement
      as="tr"
      ref={ref}
      className={cn('h-full', hideBorder && 'border-none')}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
TableRowElement.displayName = 'TableRowElement';

export { TableRowElement };
