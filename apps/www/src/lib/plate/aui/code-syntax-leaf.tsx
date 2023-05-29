import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

import { CodeSyntaxLeafToken } from '@/lib/@/CodeSyntaxLeafToken';

export function CodeSyntaxLeaf({ children, ...props }: PlateLeafProps) {
  const { leaf } = props;

  return (
    <PlateLeaf {...props}>
      <CodeSyntaxLeafToken leaf={leaf}>{children}</CodeSyntaxLeafToken>
    </PlateLeaf>
  );
}
