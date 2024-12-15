import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export const LinkElementStatic = ({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) => {
  return (
    <PlateElementStatic
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        className
      )}
      element={element}
      {...props}
    >
      {children}
    </PlateElementStatic>
  );
};
