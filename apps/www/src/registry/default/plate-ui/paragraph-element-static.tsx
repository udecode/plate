import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export const ParagraphElementStatic = ({
  children,
  className,
  element,
  ...props
}: SlateElementProps) => {
  return (
    <SlateElement
      className={cn('m-0 px-0 py-1', className)}
      element={element}
      {...props}
    >
      {children}
    </SlateElement>
  );
};
