import React, { ReactNode } from 'react';
import { UseVirtualFloatingOptions } from '@udecode/plate-floating';
import { cn, PortalBody } from '@udecode/plate-tailwind';
import { Toolbar, ToolbarProps } from './Toolbar';
import { useFloatingToolbar } from './useFloatingToolbar';

export interface BalloonToolbarProps extends ToolbarProps {
  children: ReactNode;

  /**
   * Color theme for the background/foreground.
   */
  theme?: 'dark' | 'light';

  /**
   * Show an arrow pointing to up or down depending on the direction.
   */
  arrow?: boolean;

  portalElement?: Element;

  floatingOptions?: UseVirtualFloatingOptions;

  ignoreReadOnly?: boolean;

  hideToolbar?: boolean;
}

export function BalloonToolbar(props: BalloonToolbarProps) {
  const {
    children,
    theme = 'dark',
    arrow = false,
    portalElement,
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  } = props;

  const {
    refs,
    style,
    placement = 'top',
    open,
  } = useFloatingToolbar({
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  });

  if (!open) return null;

  return (
    <PortalBody element={portalElement}>
      <Toolbar
        className={cn(
          'absolute whitespace-nowrap border border-r-4 opacity-100 ',
          'z-[500] transition-[opacity_.2s_ease-in-out]',
          theme !== 'light' &&
            'border-transparent bg-[rgb(36,42,49)] text-[rgb(157,170,182)] [&_.slate-ToolbarButton-active]:text-white [&_.slate-ToolbarButton]:hover:text-white',
          theme === 'light' &&
            'border-[rgb(196,196,196)] bg-[rgb(250,250,250)] text-[rgba(0,0,0,0.50)] [&_.slate-ToolbarButton-active]:text-black [&_.slate-ToolbarButton]:hover:text-black',

          arrow &&
            cn(
              'after:absolute after:left-1/2 after:-mt-px after:-translate-x-1/2 after:border after:border-x-transparent after:border-y-[rgb(36,42,49)] after:content-[_]',
              placement.includes('top') &&
                'after:bottom-auto after:top-full after:border-x-8 after:border-b-0 after:border-t-8',
              !placement.includes('top') &&
                'after:bottom-full after:top-auto after:border-x-8 after:border-b-8 after:border-t-0',
              // arrow border
              placement.includes('top') &&
                theme === 'light' &&
                'before:mt-0 before:border-x-[9px] before:border-b-0 before:border-t-[9px] before:border-x-transparent before:border-y-[rgb(36,42,49)]',
              !placement.includes('top') &&
                theme === 'light' &&
                'before:mt-0 before:border-x-[9px] before:border-b-[9px] before:border-t-0 before:border-x-transparent before:border-y-[rgb(36,42,49)]'
            )
        )}
        ref={refs.setFloating}
        style={style}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
}
