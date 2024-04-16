import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';

import { LayoutToolbarPopover } from './column-toolbar-popover';

export const ColumnGroupElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }, ref) => {
    return (
      <PlateElement ref={ref} className={cn(className, 'my-2')} {...props}>
        <LayoutToolbarPopover>
          <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
        </LayoutToolbarPopover>
      </PlateElement>
    );
  }
);
