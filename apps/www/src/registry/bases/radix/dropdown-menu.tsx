'use client';

import * as React from 'react';

import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

type FinalFocus = false | (() => void);
type FinalFocusRef = React.RefObject<FinalFocus | undefined>;
type MenuRoot = {
  finalFocusRef: FinalFocusRef;
  modal: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const FinalFocusContext = React.createContext<FinalFocusRef | null>(null);
const MenuRootContext = React.createContext<MenuRoot | null>(null);
const closeGestures = ['keydown', 'pointerdown'] as const;

function isSecondaryPress(event: Event) {
  return (
    event instanceof MouseEvent &&
    (event.button === 2 || (event.button === 0 && event.ctrlKey))
  );
}

function ownsGesture(event: Event, trigger: HTMLElement | null) {
  const owner = trigger?.closest('[role="toolbar"]') ?? trigger;

  return event
    .composedPath()
    .some(
      (node) =>
        node instanceof Element &&
        (node === owner || node.matches('[role="menu"]'))
    );
}

function gestureFinalFocus(
  event: Event,
  { modal, triggerRef }: MenuRoot
): FinalFocus | undefined {
  if (event instanceof KeyboardEvent) {
    return event.key === 'Tab' ? false : undefined;
  }
  if (isSecondaryPress(event)) return false;
  if (ownsGesture(event, triggerRef.current)) return undefined;

  return modal ? undefined : false;
}

function focusClaimed(trigger: HTMLElement | null) {
  let active = document.activeElement;

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }

  return !!active && active !== document.body && !trigger?.contains(active);
}

function CloseFocusWatcher({ root }: { root: MenuRoot }) {
  React.useEffect(() => {
    const record = (event: Event) => {
      root.finalFocusRef.current = gestureFinalFocus(event, root);
    };

    for (const type of closeGestures) {
      window.addEventListener(type, record, true);
    }

    return () => {
      for (const type of closeGestures) {
        window.removeEventListener(type, record, true);
      }
    };
  }, [root]);

  return null;
}

export function DropdownMenu({
  modal = true,
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenu>) {
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const root = React.useMemo(
    () => ({ finalFocusRef, modal, triggerRef }),
    [modal]
  );

  return (
    <MenuRootContext.Provider value={root}>
      <ShadcnDropdownMenu {...props} modal={modal} />
    </MenuRootContext.Provider>
  );
}

function armFinalFocus(
  event: Event,
  finalFocus: FinalFocus | undefined,
  finalFocusRef: FinalFocusRef | null
) {
  if (!event.defaultPrevented && finalFocusRef) {
    finalFocusRef.current = finalFocus;
  }
}

export function DropdownMenuItem({
  finalFocus,
  onSelect,
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenuItem> & {
  finalFocus?: FinalFocus;
}) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <ShadcnDropdownMenuItem
      {...props}
      onSelect={(event) => {
        onSelect?.(event);
        armFinalFocus(event, finalFocus, finalFocusRef);
      }}
    />
  );
}

export function DropdownMenuCheckboxItem({
  finalFocus,
  onSelect,
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenuCheckboxItem> & {
  finalFocus?: FinalFocus;
}) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <ShadcnDropdownMenuCheckboxItem
      {...props}
      onSelect={(event) => {
        onSelect?.(event);
        armFinalFocus(event, finalFocus, finalFocusRef);
      }}
    />
  );
}

export function DropdownMenuRadioItem({
  finalFocus,
  onSelect,
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenuRadioItem> & {
  finalFocus?: FinalFocus;
}) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <ShadcnDropdownMenuRadioItem
      {...props}
      onSelect={(event) => {
        onSelect?.(event);
        armFinalFocus(event, finalFocus, finalFocusRef);
      }}
    />
  );
}

export function DropdownMenuContent({
  children,
  className,
  onFinalFocus,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const root = React.useContext(MenuRootContext);
  const contentFinalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const finalFocusRef = root?.finalFocusRef ?? contentFinalFocusRef;

  return (
    <FinalFocusContext.Provider value={finalFocusRef}>
      <ShadcnDropdownMenuContent
        {...props}
        className={cn('data-[state=closed]:!animate-none', className)}
        onCloseAutoFocus={(event) => {
          const finalFocus = finalFocusRef.current;

          finalFocusRef.current = undefined;
          if (finalFocus) {
            event.preventDefault();
            finalFocus();

            return;
          }
          if (
            finalFocus === false ||
            (root && focusClaimed(root.triggerRef.current))
          ) {
            event.preventDefault();

            return;
          }
          onFinalFocus?.(event);
        }}
      >
        {root && <CloseFocusWatcher root={root} />}
        {children}
      </ShadcnDropdownMenuContent>
    </FinalFocusContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  const root = React.useContext(MenuRootContext);

  return (
    <ShadcnDropdownMenuTrigger {...props} ref={root?.triggerRef} asChild>
      {children}
    </ShadcnDropdownMenuTrigger>
  );
}
