'use client';

import {
  PagedEditable,
  type PagedEditableProps,
} from 'plitejs/pagination/react';
import React from 'react';

import {
  type EditorContentProps,
  EditorContentView,
} from '../../react/components/EditorContentView.internal';
import type { Element, RootKey } from '../../react/core';

export type PagedEditorContentProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = EditorContentProps<TElement, TRoot> &
  Pick<
    PagedEditableProps<TElement>,
    | 'engine'
    | 'fragmentation'
    | 'page'
    | 'pageView'
    | 'renderPage'
    | 'typography'
    | 'virtualize'
  >;

/**
 * Render Plate content on measured pages: `EditorContent` with its plugin
 * renderers, handlers and slots, laid out by `PagedEditable`. The app owns
 * `fragmentation` sizes and `typography`; keep both stable across renders.
 */
export const PagedEditorContent = <
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
>({
  engine,
  fragmentation,
  page,
  pageView,
  renderPage,
  typography,
  virtualize,
  ...props
}: PagedEditorContentProps<TElement, TRoot>) => (
  <EditorContentView
    {...props}
    editable={PagedEditable}
    editableExtra={{
      engine,
      fragmentation,
      page,
      pageView,
      renderPage,
      typography,
      virtualize,
    }}
  />
);
