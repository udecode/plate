import React from 'react';

import type { PlateLeafStaticProps } from '@udecode/plate-common';

import { PlateLeafStatic } from '@udecode/plate-common';

export function CodeSyntaxLeafStatic({ children, ...props }: PlateLeafStaticProps) {
  return <PlateLeafStatic {...props}>{children}</PlateLeafStatic>;
}
