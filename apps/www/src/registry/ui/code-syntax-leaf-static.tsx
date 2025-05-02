import React from 'react';

import type { SlateLeafProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate';

export function CodeSyntaxLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return (
    <SlateLeaf className={cn(tokenClassName, className)} {...props}>
      {children}
    </SlateLeaf>
  );
}
