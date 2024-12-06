'use client';

import React from 'react';

import type { LintDecoration } from '@udecode/plate-lint/react';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf, useEditorPlugin } from '@udecode/plate-common/react';
import { ExperimentalLintPlugin } from '@udecode/plate-lint/react';

export const LintLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    const { setOption } = useEditorPlugin(ExperimentalLintPlugin);
    const leaf = props.leaf as LintDecoration;

    return (
      <PlateLeaf
        ref={ref}
        as="mark"
        className={cn('bg-inherit text-red-400', className)}
        onClick={(e) => {
          e.preventDefault();
          setOption('activeToken', leaf.token);
        }}
        {...props}
      >
        {children}
      </PlateLeaf>
    );
  }
);
