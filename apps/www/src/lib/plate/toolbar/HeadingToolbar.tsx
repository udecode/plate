import React from 'react';
import { cn } from '@udecode/plate-tailwind';
import { Toolbar, ToolbarProps } from './Toolbar';

export const HeadingToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'sticky left-0 top-[57px] z-40 w-full flex-wrap overflow-hidden border-b-2 bg-background p-1',
          'border-[#eee]',
          '[&_.slate-ToolbarButton-active]:text-[#06c] [&_.slate-ToolbarButton]:hover:text-[#06c]',
          className
        )}
        {...props}
      />
    );
  }
);
