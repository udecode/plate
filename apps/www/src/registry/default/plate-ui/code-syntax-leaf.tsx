'use client';

import React from 'react';
import { useCodeSyntaxLeaf } from '@udecode/plate-code-block';
import { PlateLeaf } from '@udecode/plate-common';

import { withRef } from '@/lib/utils';

export const CodeSyntaxLeaf = withRef(
  PlateLeaf,
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
