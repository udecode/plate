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
        className={cn(
          'bg-inherit',
          leaf.annotations.some((annotation) => annotation.type === 'emoji') &&
            'text-orange-400',
          leaf.annotations.some(
            (annotation) => annotation.type === undefined
          ) &&
            'underline decoration-red-500 underline-offset-2 selection:underline selection:decoration-red-500',

          className
        )}
        onMouseDown={() => {
          setTimeout(() => {
            setOption('activeAnnotations', leaf.annotations);
          }, 0);
        }}
        {...props}
      >
        {children}
      </PlateLeaf>
    );
  }
);
