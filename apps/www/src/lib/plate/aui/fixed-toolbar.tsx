import React from 'react';

import { Toolbar, ToolbarProps } from '@/components/ui/toolbar';
import { cn } from '@/lib/utils';

const FixedToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'sticky left-0 top-[56px] z-40 w-full justify-between overflow-x-scroll border-b border-b-border',
          className
        )}
        {...props}
      />
    );
  }
);
FixedToolbar.displayName = 'FixedToolbar';

export { FixedToolbar };
