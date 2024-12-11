import React from 'react';

import type { StaticElementProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';

import { StaticElement } from './paragraph-element';

export function TableRowStaticElement({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  // const { hideBorder } = element as TTableRowElement;

  return (
    <StaticElement
      as="tr"
      className={cn('h-full', className)}
      element={element}
      {...props}
    >
      {children}
    </StaticElement>
  );
}
