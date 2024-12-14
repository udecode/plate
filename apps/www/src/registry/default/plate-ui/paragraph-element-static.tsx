import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export const ParagraphElementStatic = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  return (
    <PlateStaticElement
      className={cn('m-0 px-0 py-1', className)}
      element={element}
      {...props}
    >
      {children}
    </PlateStaticElement>
  );
};
