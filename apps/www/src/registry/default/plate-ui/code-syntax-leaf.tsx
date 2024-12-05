'use client';
import React from 'react';

import { useCodeSyntaxLeaf } from '@udecode/plate-code-block/react';
import { PlateLeaf } from '@udecode/plate-utils/react';
import { withRef } from '@udecode/react-utils';

export const CodeSyntaxLeaf = withRef<typeof PlateLeaf>(
  ({ children, ...props }, ref) => {
    const { leaf } = props;

    const { tokenProps } = useCodeSyntaxLeaf({ leaf });

    return (
      <PlateLeaf ref={ref} {...props}>
        <span {...tokenProps}>{children}</span>
      </PlateLeaf>
    );
  }
);
