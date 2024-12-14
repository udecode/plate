import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export const LinkElementStatic = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  return (
    <PlateStaticElement
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        className
      )}
      element={element}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
};
