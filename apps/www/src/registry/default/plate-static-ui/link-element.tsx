import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';

import { StaticElement } from './paragraph-element';

export const LinkStaticElement = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  return (
    <StaticElement
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        className
      )}
      element={element}
      // {...(linkProps as any)}
      {...props}
    >
      {children}
    </StaticElement>
  );
};
