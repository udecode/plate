'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
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

type FloatingPopoverContextValue = {
  anchor: Exclude<FloatingAnchor, React.ReactElement>;
  open: boolean;
  setAnchor: React.Dispatch<
    React.SetStateAction<Exclude<FloatingAnchor, React.ReactElement>>
  >;
};

const FloatingPopoverContext = React.createContext<
  FloatingPopoverContextValue | undefined
>(undefined);

function useFloatingPopoverContext() {
  const context = React.useContext(FloatingPopoverContext);

  if (!context) {
    throw new Error('FloatingPopover parts must be inside FloatingPopover.');
  }

  return context;
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value);
      else if (ref) ref.current = value;
    }
  };
}

export function FloatingPopover({
  children,
  defaultOpen = false,
  onOpenChange,
  open,
  ...props
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [anchor, setAnchor] =
    React.useState<Exclude<FloatingAnchor, React.ReactElement>>(null);
  const resolvedOpen = open ?? uncontrolledOpen;
  const context = React.useMemo(
    () => ({ anchor, open: resolvedOpen, setAnchor }),
    [anchor, resolvedOpen]
  );

  return (
    <FloatingPopoverContext.Provider value={context}>
      <PopoverPrimitive.Root
        {...props}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={(nextOpen) => {
          setUncontrolledOpen(nextOpen);
          onOpenChange?.(nextOpen);
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
  const { setAnchor } = useFloatingPopoverContext();
  const reactElement = React.isValidElement(element) ? element : null;

  React.useLayoutEffect(() => {
    if (React.isValidElement(element)) return undefined;

    setAnchor(element);

    return () => setAnchor(null);
  }, [element, reactElement, setAnchor]);

  if (!reactElement) return null;

  const elementWithRef = reactElement as React.ReactElement<{
    ref?: React.Ref<Element>;
  }>;

  return React.cloneElement(elementWithRef, {
    ref: composeRefs(elementWithRef.props.ref, setAnchor),
  });
}

export function FloatingPopoverTrigger({
  children,
}: {
  children: React.ReactElement;
}) {
  return <PopoverPrimitive.Trigger render={children} />;
}

export function FloatingPopoverContent({
  align = 'center',
  alignOffset,
  className,
  onFinalFocus,
  onEscapeKeyDown,
  onKeyDown,
  onInitialFocus,
  side = 'bottom',
  sideOffset = 4,
  style,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInitialFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const { anchor, open } = useFloatingPopoverContext();

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
            onFinalFocus
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
