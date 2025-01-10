import React from 'react';

import type { SlateLeafProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate';

export const CodeLeafStatic = ({
  children,
  className,
  ...props
}: SlateLeafProps) => {
  return (
    <SlateLeaf
      as="code"
      className={cn(
        className,
        'whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm'
      )}
      {...props}
    >
      {children}
    </SlateLeaf>
  );
};
