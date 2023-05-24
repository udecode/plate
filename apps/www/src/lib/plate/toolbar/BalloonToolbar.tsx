import React, { ReactNode } from 'react';
import { PortalBody } from '@udecode/plate-common';
import { UseVirtualFloatingOptions } from '@udecode/plate-floating';
import { cn } from '@udecode/plate-tailwind';
import { ToolbarProps } from './ToolbarOld';
import { useFloatingToolbar } from './useFloatingToolbar';

import { Toolbar } from '@/components/ui/toolbar';

export interface BalloonToolbarProps extends ToolbarProps {
  children: ReactNode;

  portalElement?: Element;

  floatingOptions?: UseVirtualFloatingOptions;

  ignoreReadOnly?: boolean;

  hideToolbar?: boolean;
}

export function BalloonToolbar(props: BalloonToolbarProps) {
  const {
    children,
    portalElement,
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  } = props;

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
          'absolute z-40 whitespace-nowrap border bg-popover opacity-100 shadow-md'
        )}
        ref={refs.setFloating}
        style={style}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
}
