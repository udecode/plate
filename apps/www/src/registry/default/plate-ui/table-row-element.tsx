import React from 'react';
import { PlateElement } from '@udecode/plate-common';

import { cn, extendProps } from '@/lib/utils';

export const TableRowElement = extendProps(PlateElement)<{
  hideBorder?: boolean;
}>(({ hideBorder, children, ...props }, ref) => {
  return (
    <PlateElement
      asChild
      ref={ref}
      className={cn('h-full', hideBorder && 'border-none')}
      {...props}
    >
      <tr>{children}</tr>
    </PlateElement>
  );
});
