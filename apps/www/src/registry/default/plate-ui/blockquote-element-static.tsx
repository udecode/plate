import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export const BlockquoteElementStatic = ({
  children,
  className,
  ...props
}: SlateElementProps) => {
  return (
    <SlateElement
      as="blockquote"
      className={cn('my-1 border-l-2 pl-6 italic', className)}
      {...props}
    >
      {children}
    </SlateElement>
  );
};
