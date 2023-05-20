import React from 'react';
import { cn } from '@udecode/plate-tailwind';
import { Toolbar, ToolbarProps } from './Toolbar';

export const HeadingToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'relative -mx-5 mb-5 mt-0 flex-wrap border-b-2 pt-px',
          'border-[#eee] px-[18px] pb-[17px]',
          '[&_.slate-ToolbarButton-active]:text-[#06c] [&_.slate-ToolbarButton]:hover:text-[#06c]',
          className
        )}
        {...props}
      />
    );
  }
);
