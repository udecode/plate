import React from 'react';
import { cva } from '@udecode/plate-tailwind';

export const toolbarVariants = cva(
  'box-content flex min-h-[40px] select-none items-center text-[rgb(68,68,68)]',
  {
    variants: {
      a: {
        true: '',
      },
    },
  }
);

export interface ToolbarProps extends React.ComponentPropsWithoutRef<'div'> {}

export const Toolbar = React.forwardRef<React.ElementRef<'div'>, ToolbarProps>(
  ({ className, ...props }: ToolbarProps, ref) => (
    <div
      data-testid="Toolbar"
      ref={ref}
      className={toolbarVariants({ className })}
      {...props}
    />
  )
);
