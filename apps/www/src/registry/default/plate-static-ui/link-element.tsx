import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export const LinkStaticElement = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  return (
    <PlateStaticElement
      as="a"
      className={cn(
        'text-primary decoration-primary font-medium underline underline-offset-4',
        className
      )}
      element={element}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
};
