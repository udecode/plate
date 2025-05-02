import React from 'react';

import type { SlateElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate';

export const LinkElementStatic = ({
  children,
  className,
  ...props
}: SlateElementProps) => {
  return (
    <SlateElement
      as="a"
      className={cn(
        className,
        'font-medium text-primary underline decoration-primary underline-offset-4'
      )}
      {...props}
    >
      {children}
    </SlateElement>
  );
};
