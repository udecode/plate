import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export const BlockquoteElementStatic = ({
  children,
  className,
  ...props
}: PlateElementStaticProps) => {
  return (
    <PlateElementStatic
      as="blockquote"
      className={cn('my-1 border-l-2 pl-6 italic', className)}
      {...props}
    >
      {children}
    </PlateElementStatic>
  );
};
