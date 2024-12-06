'use client';

import React from 'react';

import type { LintDecoration } from '@/components/editor/lint/types';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf, useEditorPlugin } from '@udecode/plate-common/react';

import { LintPlugin } from '@/components/editor/lint/lint-plugin';

export const LintLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    const { setOption } = useEditorPlugin(LintPlugin);
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
