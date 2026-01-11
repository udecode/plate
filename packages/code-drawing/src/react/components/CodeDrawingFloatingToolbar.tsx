'use client';

import * as React from 'react';

import type { TCodeDrawingElement } from '../../lib';

import {
  useEditorSelector,
  useFocusedLast,
  useReadOnly,
  useSelected,
} from 'platejs/react';

export interface CodeDrawingFloatingToolbarProps {
  children: React.ReactNode;
  element: TCodeDrawingElement;
  onRemove: () => void;
  onDownload?: () => void;
  renderToolbar?: (props: {
    children: React.ReactNode;
    onRemove: () => void;
    onDownload?: () => void;
    open: boolean;
  }) => React.ReactNode;
}

export function CodeDrawingFloatingToolbar({
  children,
  element,
  onRemove,
  onDownload,
  renderToolbar,
}: CodeDrawingFloatingToolbarProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const isFocusedLast = useFocusedLast();
  const selectionCollapsed = useEditorSelector(
    (editor) => !editor.api.isExpanded(),
    []
  );

  const open = isFocusedLast && !readOnly && selected && selectionCollapsed;

  if (!renderToolbar) {
    return <>{children}</>;
  }

  return (
    <>
      {renderToolbar({
        children,
        onRemove,
        onDownload,
        open,
      })}
    </>
  );
}
