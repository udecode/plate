import React from 'react';

import type { SlateLeafProps } from '@udecode/plate-common';

import { SlateLeaf } from '@udecode/plate-common';

export function CodeSyntaxLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps) {
  return (
    <SlateLeaf className={className} {...props}>
      {children}
    </SlateLeaf>
  );
}
