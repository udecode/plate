'use client';

import { cn } from 'cn';
import { useComposedRef } from 'platejs/react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import * as React from 'react';

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
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
      React.RefAttributes<HTMLDivElement> & {
        onPlaced?: () => void;
      }
  >;

const FloatingPopoverRefsContext = React.createContext<{
  insideElement?: Element | null;
  scrollDismissedRef: React.RefObject<boolean>;
  setHost: (host: Element | null) => void;
} | null>(null);

function isInside(
  element: Element | null | undefined,
  target: EventTarget | null
) {
  if (!element) return false;

  const NodeClass = element.ownerDocument.defaultView?.Node;

  return !!NodeClass && target instanceof NodeClass && element.contains(target);
}

export function FloatingPopover({
  defaultOpen = false,
  insideElement,
  onOpenChange,
  onOpenChangeComplete,
  open,
  ...props
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  /** Presses on this element, and focus moving into it, never dismiss the popover. */
  insideElement?: Element | null;
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
      insideElement,
      scrollDismissedRef,
      setHost: (host: Element | null) => {
        hostRef.current = host;
      },
    }),
    [insideElement]
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
  anchorHidden = false,
  className,
  onFinalFocus,
  onEscapeKeyDown,
  onInitialFocus,
  onPlaced,
  ref,
  side,
  sideOffset = 4,
  style,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  /** Hides the open popover and lets clicks through, without closing it. */
  anchorHidden?: boolean;
  onFinalFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInitialFocus?: (event: Event) => void;
  /** Called after the content has been positioned against its anchor. */
  onPlaced?: () => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const refs = React.useContext(FloatingPopoverRefsContext);
  const scrollDismissedRef = refs?.scrollDismissedRef;
  // Radix positions the content inside a wrapper, which still takes clicks
  // while only the content is hidden.
  const hideWrapper = React.useCallback(
    (content: HTMLDivElement | null) => {
      const wrapper = content?.parentElement;

      if (!wrapper) return;

      wrapper.style.visibility = anchorHidden ? 'hidden' : '';
      wrapper.style.pointerEvents = anchorHidden ? 'none' : '';
    },
    [anchorHidden]
  );
  const contentRef = useComposedRef(ref, hideWrapper);

  return (
    <PopoverPrimitive.Portal>
      <PopoverContentWithPlaced
        {...props}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          'cn-popover-content z-50 w-72 origin-(--radix-popover-content-transform-origin) outline-hidden',
          className,
          // Visibility is transitionable, so each element inside waits out its
          // own transition duration before the inherited hide stops its paint.
          anchorHidden && 'transition-none **:transition-none!'
        )}
        onCloseAutoFocus={(event) => {
          if (scrollDismissedRef?.current) {
            event.preventDefault();

            return;
          }
          onFinalFocus?.(event);
        }}
        onEscapeKeyDown={onEscapeKeyDown}
        onInteractOutside={(event) => {
          if (isInside(refs?.insideElement, event.target)) {
            event.preventDefault();
          }
        }}
        onOpenAutoFocus={onInitialFocus}
        onPlaced={onPlaced}
        ref={contentRef}
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
