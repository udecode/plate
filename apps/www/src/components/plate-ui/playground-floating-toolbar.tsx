'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import {
  PortalBody,
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

import { Toolbar } from '@/registry/default/plate-ui/toolbar';

export const PlaygroundFloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const editor = useEditorRef();
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorSelectors.focus();
  const isFloatingLinkOpen = !!editor.useOption(LinkPlugin, 'mode');
  const isAIChatOpen = editor.useOption(AIChatPlugin, 'open');

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen || isAIChatOpen,
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
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <PortalBody>
      <Toolbar
        ref={ref}
        className={cn(
          'absolute z-50 whitespace-nowrap rounded-md border bg-popover p-1 opacity-100 shadow-md print:hidden',
          'max-w-[80vw]'
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
});
