import React, { ReactNode } from 'react';
import { PortalBody } from '@udecode/plate-common';
import {
  useFloatingToolbar,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';

import { Toolbar, ToolbarProps } from '@/components/ui/toolbar';
import { cn } from '@/lib/utils';

export interface FloatingToolbarProps extends ToolbarProps {
  children: ReactNode;

  portalElement?: Element;

  floatingOptions?: UseVirtualFloatingOptions;

  ignoreReadOnly?: boolean;

  hideToolbar?: boolean;
}

export function FloatingToolbar({
  portalElement,
  floatingOptions,
  ignoreReadOnly,
  hideToolbar,
  children,
  ...props
}: FloatingToolbarProps) {
  const { refs, style, open } = useFloatingToolbar({
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  });

  if (!open) return null;

  return (
    <PortalBody element={portalElement}>
      <Toolbar
        className={cn(
          'absolute z-50 whitespace-nowrap border bg-popover opacity-100 shadow-md'
        )}
        ref={refs.setFloating}
        style={style}
        {...props}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
}
