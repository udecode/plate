'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-core/react';
import {
  type UseVirtualFloatingOptions,
  flip,
  getDOMSelectionBoundingClientRect,
  offset,
} from '@udecode/plate-floating';
import {
  type LinkFloatingToolbarState,
  useVirtualFloatingLink,
} from '@udecode/plate-link/react';

import { popoverVariants } from './popover';

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(12),
    flip({
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
      padding: 12,
    }),
  ],
  placement: 'bottom-start',
};

export interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState;
}

export function MediaFloatingToolbar() {
  const editor = useEditorRef();

  const isOpen = true;

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
    open: isOpen,
    whileElementsMounted: () => () => {},
    ...floatingOptions,
  });

  return (
    <div
      id="asdas"
      ref={floating.refs.setFloating}
      className={cn(popoverVariants(), 'w-auto p-1')}
    >
      <span>123</span>
    </div>
  );
}
