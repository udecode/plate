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

const PopoverContentWithPlaced =
  PopoverPrimitive.Content as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
      onPlaced?: () => void;
    }
  >;

export function FloatingPopover({
  onOpenChange,
  onOpenChangeComplete,
  ...props
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  open?: boolean;
}>) {
  return (
    <PopoverPrimitive.Root
      {...props}
      onOpenChange={(open) => {
        onOpenChange?.(open);
        requestAnimationFrame(() => onOpenChangeComplete?.(open));
      }}
    />
  );
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
  onPlaced,
  side,
  sideOffset = 4,
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInitialFocus?: (event: Event) => void;
  /** Called after the content has been positioned against its anchor. */
  onPlaced?: () => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverContentWithPlaced
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
        onPlaced={onPlaced}
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
