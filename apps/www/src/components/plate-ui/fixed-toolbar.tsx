import React from 'react';

import { Toolbar, ToolbarProps } from '@/components/ui/toolbar';
import { cn } from '@/lib/utils';

const FixedToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'sticky left-0 top-[57px] z-50 w-full justify-between overflow-x-scroll border-b border-b-border rounded-t-lg supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur',
          className
        )}
        {...props}
      />
    );
  }
);
FixedToolbar.displayName = 'FixedToolbar';

export { FixedToolbar };
