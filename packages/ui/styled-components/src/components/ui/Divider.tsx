import React from 'react';
import { cn } from '../../utils';

const Divider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    className={cn('mx-2 my-0.5 w-px bg-gray-200', className)}
    ref={ref}
    {...props}
  />
));
Divider.displayName = 'Divider';

export { Divider };
