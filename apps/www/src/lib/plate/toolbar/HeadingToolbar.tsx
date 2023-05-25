import React from 'react';
import { cn } from '@udecode/plate-tailwind';

import { Toolbar, ToolbarProps } from '@/components/ui/toolbar';

const HeadingToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'sticky left-0 top-[57px] z-40 w-full flex-wrap justify-between overflow-hidden border-b border-b-border',
          className
        )}
        {...props}
      />
    );
  }
);
HeadingToolbar.displayName = 'HeadingToolbar';

export { HeadingToolbar };
