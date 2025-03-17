import React from 'react';

import type { SlateLeafProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate';

export function CodeSyntaxLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps) {
  const syntaxClassName = `prism-token token ${props.leaf.tokenType}`;

  return (
    <SlateLeaf className={cn(className, syntaxClassName)} {...props}>
      {children}
    </SlateLeaf>
  );
}
