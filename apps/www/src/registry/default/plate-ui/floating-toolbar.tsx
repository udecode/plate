import React, { ReactNode } from 'react';
import { flip, offset } from '@floating-ui/react';
import { PortalBody, useComposedRef } from '@udecode/plate-common';
import {
  useFloatingToolbar,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';

import { cn } from '@/lib/utils';

import { Toolbar, ToolbarProps } from './toolbar';

export interface FloatingToolbarProps extends ToolbarProps {
  children: ReactNode;

  floatingOptions?: UseVirtualFloatingOptions;

  ignoreReadOnly?: boolean;

  hideToolbar?: boolean;
}

const FloatingToolbar = React.forwardRef<
  React.ElementRef<typeof Toolbar>,
  FloatingToolbarProps
>(
  (
    { floatingOptions, ignoreReadOnly, hideToolbar, children, ...props },
    _ref
  ) => {
    const { refs, style, open } = useFloatingToolbar({
      floatingOptions: {
        placement: 'top',
        middleware: [
          offset(12),
          flip({
            padding: 12,
            fallbackPlacements: [
              'top-start',
              'top-end',
              'bottom-start',
              'bottom-end',
            ],
          }),
        ],
      },
      ignoreReadOnly,
      hideToolbar,
    });

    const ref = useComposedRef<HTMLDivElement>(_ref, refs.setFloating);

    if (!open) return null;

    return (
      <PortalBody>
        <Toolbar
          ref={ref}
          className={cn(
            'absolute z-50 whitespace-nowrap border bg-popover px-1 opacity-100 shadow-md'
          )}
          style={style}
          {...props}
        >
          {children}
        </Toolbar>
      </PortalBody>
    );
  }
);
FloatingToolbar.displayName = 'FloatingToolbar';

export { FloatingToolbar };
