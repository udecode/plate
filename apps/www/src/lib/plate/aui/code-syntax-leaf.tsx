import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate';

import { useCodeSyntaxLeaf } from '@/lib/@/useCodeSyntaxLeaf';

export function CodeSyntaxLeaf({ children, ...props }: PlateLeafProps) {
  const { leaf } = props;

  const { tokenProps } = useCodeSyntaxLeaf({ leaf });

  return (
    <PlateLeaf {...props}>
      <span {...tokenProps}>{children}</span>
    </PlateLeaf>
  );
}
