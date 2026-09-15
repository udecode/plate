'use client';

import {
  VirtualizedEditable,
  type VirtualizedEditableProps,
} from 'plitejs/react/virtualized';
import React from 'react';

import {
  EditorContent,
  type EditorContentProps,
} from './components/PlateContent';
import type { Element, RootKey } from './core';
import { PlateContentEditableContext } from './internal/plate-content-editable.internal';

export type VirtualizedEditorContentProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditorContentProps<TElement, TRoot> &
  Pick<
    VirtualizedEditableProps<TElement, TRoot>,
    'estimatedBlockSize' | 'overscan'
  >;

/** Render Plate content with explicit top-level viewport virtualization. */
export const VirtualizedEditorContent = <
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
>({
  estimatedBlockSize,
  overscan,
  ...props
}: VirtualizedEditorContentProps<TElement, TRoot>) => {
  const value = React.useMemo(
    () => ({
      component: VirtualizedEditable,
      props: { estimatedBlockSize, overscan },
    }),
    [estimatedBlockSize, overscan]
  );

  return (
    <PlateContentEditableContext value={value}>
      <EditorContent {...props} />
    </PlateContentEditableContext>
  );
};
