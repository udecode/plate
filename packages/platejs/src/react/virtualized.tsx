'use client';

import {
  VirtualizedEditorContent as PliteVirtualizedEditorContent,
  type VirtualizedEditorContentProps as PliteVirtualizedEditorContentProps,
} from 'plitejs/react/virtualized';
import React from 'react';

import {
  type EditorContentProps,
  EditorContentView,
} from './components/EditorContentView.internal';
import type { Element, RootKey } from './core';

export type VirtualizedEditorContentProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditorContentProps<TElement, TRoot> &
  Pick<
    PliteVirtualizedEditorContentProps<TElement, TRoot>,
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
}: VirtualizedEditorContentProps<TElement, TRoot>) => (
  <EditorContentView
    {...props}
    editable={PliteVirtualizedEditorContent}
    editableExtra={{ estimatedBlockSize, overscan }}
  />
);
