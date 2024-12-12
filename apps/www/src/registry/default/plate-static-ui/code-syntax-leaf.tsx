import React from 'react';

import type { StaticLeafProps } from '@udecode/plate-common';

import { PlateStaticLeaf } from '@udecode/plate-common';

export function CodeSyntaxStaticLeaf({ children, ...props }: StaticLeafProps) {
  return <PlateStaticLeaf {...props}>{children}</PlateStaticLeaf>;
}
