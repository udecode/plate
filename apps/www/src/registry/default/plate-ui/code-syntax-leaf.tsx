'use client';

import React from 'react';
import { useCodeSyntaxLeaf } from '@udecode/plate-code-block';
import { PlateLeaf } from '@udecode/plate-common';

import { withRef } from '@/lib/utils';

export const CodeSyntaxLeaf = withRef<typeof PlateLeaf>(
  ({ children, ...props }) => {
    const { leaf } = props;

    const { tokenProps } = useCodeSyntaxLeaf({ leaf });

    return (
      <PlateLeaf {...props}>
        <span {...tokenProps}>{children}</span>
      </PlateLeaf>
    );
  }
);
