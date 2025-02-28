'use client';

import React from 'react';

import type { CodeToken } from '@udecode/plate-code-block';

import { withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate/react';

export const CodeSyntaxLeaf = withRef<typeof PlateLeaf>(
  ({ children, ...props }, ref) => {
    const { leaf } = props;
    const token = leaf.token as CodeToken;

    const style = token
      ? {
          backgroundColor: token.bgColor,
          color: token.color,
          fontStyle: token.fontStyle === 2 ? 'italic' : undefined,
          fontWeight: token.fontStyle === 1 ? 'bold' : undefined,
        }
      : undefined;

    return (
      <PlateLeaf ref={ref} {...props} style={style}>
        {children}
      </PlateLeaf>
    );
  }
);
