import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export const ParagraphElementStatic = ({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) => {
  return (
    <PlateElementStatic
      className={cn('m-0 px-0 py-1', className)}
      element={element}
      {...props}
    >
      {children}
    </PlateElementStatic>
  );
};
