'use client';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react';
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

type FloatingAnchorTarget = Exclude<FloatingAnchor, React.ReactElement>;

const PopoverContentWithPlaced =
  PopoverPrimitive.Content as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
      React.RefAttributes<HTMLDivElement> & {
        onPlaced?: () => void;
      }
  >;

const FloatingPopoverRefsContext = React.createContext<{
  anchor: FloatingAnchorTarget;
  insideElement?: Element | null;
  open: boolean;
  /**
   * The caller owns `open` and hears no change, so nothing can dismiss the
   * popover. It renders without Radix's dismiss layer, which marks every
   * Escape handled before the editor sees it.
   */
  pinned: boolean;
  scrollDismissedRef: React.RefObject<boolean>;
  setAnchor: (anchor: FloatingAnchorTarget) => void;
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
  children,
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
  const [anchor, setAnchor] = React.useState<FloatingAnchorTarget>(null);
  const resolvedOpen = open ?? uncontrolledOpen;
  const pinned = open !== undefined && !onOpenChange;
  const hostRef = React.useRef<Element | null>(null);
  const scrollDismissedRef = React.useRef(false);
  const setHost = React.useCallback((host: Element | null) => {
    hostRef.current = host;
  }, []);
  const refs = React.useMemo(
    () => ({
      anchor,
      insideElement,
      open: resolvedOpen,
      pinned,
      scrollDismissedRef,
      setAnchor,
      setHost,
    }),
    [anchor, insideElement, pinned, resolvedOpen, setHost]
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
      {pinned ? (
        children
      ) : (
        <PopoverPrimitive.Root
          {...props}
          open={resolvedOpen}
          onOpenChange={setOpen}
        >
          {children}
        </PopoverPrimitive.Root>
      )}
    </FloatingPopoverRefsContext.Provider>
  );
}

export function FloatingPopoverAnchor({
  element,
}: {
  element: FloatingAnchor;
}) {
  const refs = React.useContext(FloatingPopoverRefsContext);
  const setAnchor = refs?.setAnchor;
  const setHost = refs?.setHost;
  const reactElement = React.isValidElement(element)
    ? (element as React.ReactElement<{ ref?: React.Ref<Element> }>)
    : null;
  const pinnedRef = useComposedRef(reactElement?.props.ref, setAnchor, setHost);

  React.useLayoutEffect(() => {
    if (!setAnchor || !setHost || React.isValidElement(element)) {
      return undefined;
    }

    setAnchor(element);
    setHost(element instanceof Element ? element : null);

    return () => {
      setAnchor(null);
      setHost(null);
    };
  }, [element, setAnchor, setHost]);

  if (refs?.pinned) {
    return reactElement
      ? React.cloneElement(reactElement, { ref: pinnedRef })
      : null;
  }

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
  const refs = React.useContext(FloatingPopoverRefsContext);

  if (refs?.pinned) return <FloatingPopoverAnchor element={children} />;

  return (
    <PopoverPrimitive.Trigger asChild ref={refs?.setHost}>
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

  if (refs?.pinned) {
    return (
      <PinnedPopoverContent
        {...props}
        align={align}
        alignOffset={alignOffset}
        anchorHidden={anchorHidden}
        className={className}
        onPlaced={onPlaced}
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        style={style}
      />
    );
  }

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

function getTransformOrigin(placedSide: string, placedAlign: string) {
  const along =
    placedAlign === 'start' ? '0%' : placedAlign === 'end' ? '100%' : '50%';

  if (placedSide === 'top') return `${along} 100%`;
  if (placedSide === 'left') return `100% ${along}`;
  if (placedSide === 'right') return `0% ${along}`;

  return `${along} 0%`;
}

// Places and marks the content the way Radix's popper does for the same props,
// so a pinned toolbar sits where a dismissable one would and still matches
// `[data-radix-popper-content-wrapper]`, which browser tests locate.
function PinnedPopoverContent({
  align = 'center',
  alignOffset,
  anchorHidden = false,
  className,
  onPlaced,
  side = 'bottom',
  sideOffset = 4,
  style,
  ...props
}: Omit<
  React.ComponentProps<typeof FloatingPopoverContent>,
  'onEscapeKeyDown' | 'onFinalFocus' | 'onInitialFocus'
>) {
  const popover = React.useContext(FloatingPopoverRefsContext);
  const anchor = popover?.anchor ?? null;
  const open = !!popover?.open;
  const onPlacedRef = React.useRef(onPlaced);
  const { floatingStyles, isPositioned, placement, refs } = useFloating({
    middleware: [
      offset({ alignmentAxis: alignOffset, mainAxis: sideOffset }),
      shift({ crossAxis: false, limiter: limitShift() }),
      flip(),
      size({
        apply: ({ availableHeight, elements, rects }) => {
          elements.floating.style.setProperty(
            '--floating-popover-anchor-width',
            `${rects.reference.width}px`
          );
          elements.floating.style.setProperty(
            '--floating-popover-available-height',
            `${availableHeight}px`
          );
        },
      }),
    ],
    open,
    placement: align === 'center' ? side : `${side}-${align}`,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
  });
  const [placedSide, placedAlign = 'center'] = placement.split('-');
  const floatingRef = useComposedRef(refs.setFloating);

  React.useLayoutEffect(() => {
    refs.setPositionReference(anchor);
  }, [anchor, refs]);
  React.useInsertionEffect(() => {
    onPlacedRef.current = onPlaced;
  });
  React.useLayoutEffect(() => {
    if (isPositioned) onPlacedRef.current?.();
  }, [isPositioned]);

  if (!open || !anchor) return null;

  return (
    <FloatingPortal>
      <div
        ref={floatingRef}
        className="z-50"
        data-radix-popper-content-wrapper=""
        style={{
          ...floatingStyles,
          minWidth: 'max-content',
          transform: isPositioned
            ? floatingStyles.transform
            : 'translate(0, -200%)',
          // A modal Radix layer below, such as a dialog or drawer the editor
          // sits in, turns off pointer events on the body, and only Radix's own
          // layers turn them back on.
          ...(anchorHidden
            ? { pointerEvents: 'none', visibility: 'hidden' }
            : { pointerEvents: 'auto' }),
        }}
      >
        <div
          {...props}
          className={cn(
            'cn-popover-content z-50 w-72 outline-hidden',
            className,
            anchorHidden && 'transition-none **:transition-none!'
          )}
          data-align={placedAlign}
          data-side={placedSide}
          data-state="open"
          style={{
            transformOrigin: getTransformOrigin(placedSide, placedAlign),
            ...style,
            animation: isPositioned ? undefined : 'none',
          }}
        />
      </div>
    </FloatingPortal>
  );
}
