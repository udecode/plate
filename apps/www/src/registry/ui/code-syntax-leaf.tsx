'use client';

import { type PlateLeafProps, PlateLeaf } from '@udecode/plate/react';

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <PlateLeaf className={tokenClassName} {...props} />;
}
