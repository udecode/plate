'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/utils';

type FloatingAnchor =
  | Element
  | React.ReactElement
  | {
      contextElement?: Element;
      getBoundingClientRect: () => DOMRect | DOMRectReadOnly;
    }
  | null;

export function FloatingPopover(
  props: React.PropsWithChildren<{
    defaultOpen?: boolean;
    modal?: boolean;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }>
) {
  return <PopoverPrimitive.Root {...props} />;
}

export function FloatingPopoverAnchor({
  element,
}: {
  element: FloatingAnchor;
}) {
  if (React.isValidElement(element)) {
    return <PopoverPrimitive.Anchor asChild>{element}</PopoverPrimitive.Anchor>;
  }

  if (!element) return null;

  return <PopoverPrimitive.Anchor virtualRef={{ current: element }} />;
}

export function FloatingPopoverTrigger({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
  );
}

export function FloatingPopoverContent({
  align = 'center',
  alignOffset,
  className,
  onFinalFocus,
  onEscapeKeyDown,
  onInitialFocus,
  side,
  sideOffset = 4,
  style,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInitialFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        {...props}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          'cn-popover-content z-50 w-72 origin-(--radix-popover-content-transform-origin) outline-hidden',
          className
        )}
        onCloseAutoFocus={onFinalFocus}
        onEscapeKeyDown={onEscapeKeyDown}
        onOpenAutoFocus={onInitialFocus}
        side={side}
        sideOffset={sideOffset}
        style={
          {
            '--floating-popover-anchor-width':
              'var(--radix-popover-trigger-width)',
            '--floating-popover-available-height':
              'var(--radix-popper-available-height)',
            ...style,
          } as React.CSSProperties
        }
      />
    </PopoverPrimitive.Portal>
  );
}
