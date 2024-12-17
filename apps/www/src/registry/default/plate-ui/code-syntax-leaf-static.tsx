import React from 'react';

import type { SlateLeafProps } from '@udecode/plate-common';

import { SlateLeaf } from '@udecode/plate-common';

export function CodeSyntaxLeafStatic({
  children,
  ...props
}: SlateLeafProps) {
  return <SlateLeaf {...props}>{children}</SlateLeaf>;
}
