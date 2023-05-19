import React, { forwardRef, PropsWithoutRef, ReactNode, SVGProps } from 'react';
import { cn } from '@udecode/plate-styled-components';

export interface IconProps extends PropsWithoutRef<SVGProps<SVGSVGElement>> {
  title?: ReactNode;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn('inline-block h-full overflow-hidden', className)}
        {...props}
      >
        {title && <title key="icon-title">{title}</title>}
        {children}
      </svg>
    );
  }
);
