'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useToolbarScrollDismiss } from '@/registry/components/editor/toolbar-overlay';

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

const FloatingPopoverRefsContext = React.createContext<{
  scrollDismissedRef: React.RefObject<boolean>;
  setHost: (host: Element | null) => void;
} | null>(null);

export function FloatingPopover({
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  open,
  ...props
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  open?: boolean;
}>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
  const hostRef = React.useRef<Element | null>(null);
  const scrollDismissedRef = React.useRef(false);
  const refs = React.useMemo(
    () => ({
      scrollDismissedRef,
      setHost: (host: Element | null) => {
        hostRef.current = host;
      },
    }),
    []
  );
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
    requestAnimationFrame(() => onOpenChangeComplete?.(next));
  };

  React.useEffect(() => {
    if (resolvedOpen) scrollDismissedRef.current = false;
  }, [resolvedOpen]);
  useToolbarScrollDismiss(resolvedOpen, hostRef, () => {
    scrollDismissedRef.current = true;
    setOpen(false);
  });

  return (
    <FloatingPopoverRefsContext.Provider value={refs}>
      <PopoverPrimitive.Root
        {...props}
        open={resolvedOpen}
        onOpenChange={setOpen}
      />
    </FloatingPopoverRefsContext.Provider>
  );
}

export function FloatingPopoverAnchor({
  element,
}: {
  element: FloatingAnchor;
}) {
  const setHost = React.useContext(FloatingPopoverRefsContext)?.setHost;

  React.useLayoutEffect(() => {
    if (!setHost || !(element instanceof Element)) return undefined;

    setHost(element);

    return () => setHost(null);
  }, [element, setHost]);

  if (React.isValidElement(element)) {
    return (
      <PopoverPrimitive.Anchor asChild ref={setHost}>
        {element}
      </PopoverPrimitive.Anchor>
    );
  }

  if (!element) return null;

  return <PopoverPrimitive.Anchor virtualRef={{ current: element }} />;
}

export function FloatingPopoverTrigger({
  children,
}: {
  children: React.ReactElement;
}) {
  const setHost = React.useContext(FloatingPopoverRefsContext)?.setHost;

  return (
    <PopoverPrimitive.Trigger asChild ref={setHost}>
      {children}
    </PopoverPrimitive.Trigger>
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
  const scrollDismissedRef = React.useContext(
    FloatingPopoverRefsContext
  )?.scrollDismissedRef;

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
        onCloseAutoFocus={(event) => {
          if (scrollDismissedRef?.current) {
            event.preventDefault();

            return;
          }
          onFinalFocus?.(event);
        }}
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
