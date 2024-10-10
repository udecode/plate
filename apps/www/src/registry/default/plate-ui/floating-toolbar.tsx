'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import {
  useComposedRef,
  useEditorId,
  useEditorRef,
  useEventEditorSelectors,
} from '@udecode/plate-common/react';
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';
import { LinkPlugin } from '@udecode/plate-link/react';

import { Toolbar } from './toolbar';

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const editor = useEditorRef();
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorSelectors.focus();
  const isFloatingLinkOpen = !!editor.useOption(LinkPlugin, 'mode');

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      placement: 'top',
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        ref={ref}
        className={cn(
          'absolute z-50 whitespace-nowrap rounded-md border bg-popover px-1 opacity-100 shadow-md print:hidden'
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
});
