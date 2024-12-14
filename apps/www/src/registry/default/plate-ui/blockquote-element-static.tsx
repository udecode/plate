import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { PlateStaticElement } from '@udecode/plate-common';

import { cn } from '../lib/utils';

export const BlockquoteElementStatic = ({
  children,
  className,
  ...props
}: StaticElementProps) => {
  return (
    <PlateStaticElement
      as="blockquote"
      className={cn('my-1 border-l-2 pl-6 italic', className)}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
};
