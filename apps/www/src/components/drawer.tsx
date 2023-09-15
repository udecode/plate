'use client';

import { forwardRef } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerContent = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    portalClassName?: string;
    overlayClassName?: string;
  }
>(
  (
    { className, portalClassName, overlayClassName, style, children, ...props },
    ref
  ) => (
    <DrawerPrimitive.Portal className={portalClassName}>
      <DrawerPrimitive.Overlay
        className={cn('fixed inset-0 z-50 bg-slate-950/60', overlayClassName)}
      />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 mt-24 h-[96%] rounded-t-[10px] border bg-background',
          className
        )}
        style={{ zIndex: 50, ...style }}
        {...props}
      >
        <div className="absolute left-1/2 top-3 h-2 w-[100px] translate-x-[-50%] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
);
DrawerContent.displayName = 'DrawerContent';

export { DrawerTrigger, DrawerContent };
