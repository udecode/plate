import React from 'react';
import { cn } from '@udecode/plate-styled-components';
import { Toolbar, ToolbarProps } from '../Toolbar/Toolbar';

export const HeadingToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (props: ToolbarProps, ref) => {
    return (
      <Toolbar
        ref={ref}
        className={cn(
          'relative -mx-5 mb-5 mt-0 flex-wrap border-b-2 pt-px',
          'border-[#eee] px-[18px] pb-[17px]',
          '[&_.slate-ToolbarButton-active]:text-[#06c] [&_.slate-ToolbarButton]:hover:text-[#06c]'
        )}
        {...props}
      />
    );
  }
);
