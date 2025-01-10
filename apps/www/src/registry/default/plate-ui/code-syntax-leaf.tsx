'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate/react';
import { useCodeSyntaxLeaf } from '@udecode/plate-code-block/react';

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
