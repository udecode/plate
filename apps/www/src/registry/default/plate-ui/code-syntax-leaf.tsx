'use client';

import React from 'react';

import type { StaticLeafProps } from '@udecode/plate-core';

import { withRef } from '@udecode/cn';
import { useCodeSyntaxLeaf } from '@udecode/plate-code-block/react';
import { PlateLeaf } from '@udecode/plate-common/react';

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

export function CodeSyntaxStaticLeaf({ children, ...props }: StaticLeafProps) {
  return <div {...props}>{children}</div>;
}
