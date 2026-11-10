'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useComposedRef } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  isToolbarSwipe,
  useToolbarScrollDismiss,
} from '@/registry/components/editor/toolbar-overlay';

type FloatingAnchor =
  | Element
  | React.ReactElement
  | {
      contextElement?: Element;
      getBoundingClientRect: () => DOMRect | DOMRectReadOnly;
    }
  | null;

type FloatingPopoverContextValue = {
  anchor: Exclude<FloatingAnchor, React.ReactElement>;
  open: boolean;
  scrollDismissed: boolean;
  setAnchor: React.Dispatch<
    React.SetStateAction<Exclude<FloatingAnchor, React.ReactElement>>
  >;
  setHost: (host: Element | null) => void;
};

const FloatingPopoverContext = React.createContext<
  FloatingPopoverContextValue | undefined
>(undefined);

function isInside(
  element: Element | null | undefined,
  target: EventTarget | null
) {
  if (!element) return false;

  const NodeClass = element.ownerDocument.defaultView?.Node;

  return !!NodeClass && target instanceof NodeClass && element.contains(target);
}

// Safari with an input method such as WeType can send a tap's click to the
// common ancestor of the previous press and this release, so the element under
// the pointer names the pressed one.
// https://bugs.webkit.org/show_bug.cgi?id=219670
function isPressInside(element: Element | null | undefined, event: Event) {
  if (!element) return false;
  if (isInside(element, event.target)) return true;

  const { defaultView } = element.ownerDocument;

  return (
    !!defaultView &&
    event instanceof defaultView.MouseEvent &&
    isInside(
      element,
      element.ownerDocument.elementFromPoint(event.clientX, event.clientY)
    )
  );
}

function useFloatingPopoverContext() {
  const context = React.useContext(FloatingPopoverContext);

  if (!context) {
    throw new Error('FloatingPopover parts must be inside FloatingPopover.');
  }

  return context;
}

export function FloatingPopover({
  children,
  defaultOpen = false,
  insideElement,
  onOpenChange,
  open,
  ...props
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  /** Presses on this element or with the pointer over it, and focus moving into it, never dismiss the popover. */
  insideElement?: Element | null;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  open?: boolean;
}>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [anchor, setAnchor] =
    React.useState<Exclude<FloatingAnchor, React.ReactElement>>(null);
  const [scrollDismissed, setScrollDismissed] = React.useState(false);
  const hostRef = React.useRef<Element | null>(null);
  const setHost = React.useCallback((host: Element | null) => {
    hostRef.current = host;
  }, []);
  const resolvedOpen = open ?? uncontrolledOpen;
  const [wasOpen, setWasOpen] = React.useState(resolvedOpen);
  const context = React.useMemo(
    () => ({ anchor, open: resolvedOpen, scrollDismissed, setAnchor, setHost }),
    [anchor, resolvedOpen, scrollDismissed, setHost]
  );
  const setOpen = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  if (wasOpen !== resolvedOpen) {
    setWasOpen(resolvedOpen);
    if (resolvedOpen) setScrollDismissed(false);
  }
  const toolbar = useToolbarScrollDismiss(resolvedOpen, hostRef, () => {
    setScrollDismissed(true);
    setOpen(false);
  });

  return (
    <FloatingPopoverContext.Provider value={context}>
      <PopoverPrimitive.Root
        {...props}
        open={resolvedOpen}
        onOpenChange={(nextOpen, details) => {
          if (isToolbarSwipe(toolbar, details.event)) {
            details.cancel();

            return;
          }
          if (
            (details.reason === 'outside-press' &&
              isPressInside(insideElement, details.event)) ||
            (details.reason === 'focus-out' &&
              'relatedTarget' in details.event &&
              isInside(insideElement, details.event.relatedTarget))
          ) {
            details.cancel();

            return;
          }
          setScrollDismissed(
            !!toolbar &&
              (details.event?.type === 'touchmove' ||
                details.event?.type === 'touchend')
          );
          setOpen(nextOpen);
        }}
      >
        {children}
      </PopoverPrimitive.Root>
    </FloatingPopoverContext.Provider>
  );
}

export function FloatingPopoverAnchor({
  element,
}: {
  element: FloatingAnchor;
}) {
  const { setAnchor, setHost } = useFloatingPopoverContext();
  const reactElement = React.isValidElement(element) ? element : null;

  React.useLayoutEffect(() => {
    if (React.isValidElement(element)) return undefined;

    setAnchor(element);
    setHost(element instanceof Element ? element : null);

    return () => {
      setAnchor(null);
      setHost(null);
    };
  }, [element, reactElement, setAnchor, setHost]);

  const elementWithRef = reactElement as React.ReactElement<{
    ref?: React.Ref<Element>;
  }> | null;
  const ref = useComposedRef(elementWithRef?.props.ref, setAnchor, setHost);

  return elementWithRef ? React.cloneElement(elementWithRef, { ref }) : null;
}

export function FloatingPopoverTrigger({
  children,
}: {
  children: React.ReactElement;
}) {
  const { setHost } = useFloatingPopoverContext();

  return <PopoverPrimitive.Trigger ref={setHost} render={children} />;
}

export function FloatingPopoverContent({
  align = 'center',
  alignOffset,
  className,
  onFinalFocus,
  onEscapeKeyDown,
  onKeyDown,
  onInitialFocus,
  onPlaced,
  side = 'bottom',
  sideOffset = 4,
  style,
  ...props
}: React.ComponentProps<'div'> & {
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
  const { anchor, open, scrollDismissed } = useFloatingPopoverContext();
  const placedAnchor = React.useRef<typeof anchor>(null);

  React.useEffect(() => {
    if (!anchor || !open) {
      placedAnchor.current = null;
      return;
    }
    if (placedAnchor.current === anchor) return;

    placedAnchor.current = anchor;
    onPlaced?.();
  }, [anchor, onPlaced, open]);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          {...props}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'cn-popover-content cn-popover-content-logical z-50 w-72 origin-(--transform-origin) outline-hidden',
            className
          )}
          finalFocus={
            scrollDismissed
              ? false
              : onFinalFocus
                ? () => {
                    const event = new Event('closeAutoFocus', {
                      cancelable: true,
                    });
                    onFinalFocus(event);

                    return !event.defaultPrevented;
                  }
                : undefined
          }
          initialFocus={
            onInitialFocus
              ? () => {
                  const event = new Event('openAutoFocus', {
                    cancelable: true,
                  });
                  onInitialFocus(event);

                  return !event.defaultPrevented;
                }
              : undefined
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onEscapeKeyDown?.(event.nativeEvent);
            }
            onKeyDown?.(event);
          }}
          style={
            {
              '--floating-popover-anchor-width': 'var(--anchor-width)',
              '--floating-popover-available-height': 'var(--available-height)',
              ...style,
            } as React.CSSProperties
          }
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
