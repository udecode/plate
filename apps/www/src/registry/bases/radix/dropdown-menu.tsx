'use client';

import { useComposedRef } from 'platejs/react';
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
import {
  type FinalFocus,
  FinalFocusContext,
  MenuPopupHold,
  type FinalFocusRef,
  focusClaimed,
  MenuRootContext,
  outsideFinalFocus,
  takeFinalFocus,
  useMenuRoot,
} from '@/registry/components/editor/menu-close-focus';

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

const SetOpenContext = React.createContext<((open: boolean) => void) | null>(
  null
);

export function DropdownMenu({
  modal = true,
  onOpenChange,
  ...props
}: Omit<React.ComponentProps<typeof ShadcnDropdownMenu>, 'onOpenChange'> & {
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    props.defaultOpen ?? false
  );
  const controlled = props.open !== undefined;
  const open = props.open ?? uncontrolledOpen;
  const root = useMenuRoot(modal, open);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!controlled) setUncontrolledOpen(next);

      onOpenChange?.(next);
    },
    [controlled, onOpenChange, open]
  );

  return (
    <MenuRootContext.Provider value={root}>
      <SetOpenContext.Provider value={setOpen}>
        <ShadcnDropdownMenu
          {...props}
          modal={modal}
          open={open}
          onOpenChange={setOpen}
        />
      </SetOpenContext.Provider>
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
  ref,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onAbort'> & {
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
        ref={ref}
        className={cn('data-[state=closed]:!animate-none', className)}
        onEscapeKeyDown={() => {
          finalFocusRef.current = undefined;
        }}
        onInteractOutside={(event) => {
          if (root && !event.defaultPrevented) {
            finalFocusRef.current = outsideFinalFocus(
              event.detail.originalEvent,
              root
            );
          }
        }}
        onCloseAutoFocus={(event) => {
          const finalFocus = takeFinalFocus(finalFocusRef);

          if (finalFocus) {
            event.preventDefault();
            finalFocus();

            return;
          }
          // FocusScope calls this from a timer after the content unmounts, so focus is never still inside the menu here.
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
        {root && <MenuPopupHold root={root} />}
        {children}
      </ShadcnDropdownMenuContent>
    </FinalFocusContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  disabled,
  onClick,
  onKeyDown,
  onPointerCancel,
  onPointerDown,
  ref,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  const root = React.useContext(MenuRootContext);
  const setOpen = React.useContext(SetOpenContext);
  const triggerRef = useComposedRef(ref, root?.triggerRef);
  const pendingTapOpenRef = React.useRef<boolean | null>(null);

  return (
    <ShadcnDropdownMenuTrigger
      {...props}
      ref={triggerRef}
      disabled={disabled}
      onClick={(event) => {
        const pendingTapOpen = pendingTapOpenRef.current;
        pendingTapOpenRef.current = null;
        onClick?.(event);

        if (pendingTapOpen !== null && !event.defaultPrevented) {
          setOpen?.(pendingTapOpen);
        }
      }}
      onKeyDown={(event) => {
        pendingTapOpenRef.current = null;
        onKeyDown?.(event);
      }}
      onPointerCancel={(event) => {
        pendingTapOpenRef.current = null;
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        pendingTapOpenRef.current = null;
        onPointerDown?.(event);

        if (!root || !setOpen || event.pointerType === 'mouse') return;
        if (
          !event.defaultPrevented &&
          !disabled &&
          event.button === 0 &&
          !event.ctrlKey
        ) {
          pendingTapOpenRef.current = !root.open;
        }

        // Radix opens on pointerdown, so a swipe that starts on the button would
        // open its menu.
        event.preventDefault();
      }}
      asChild
    >
      {children}
    </ShadcnDropdownMenuTrigger>
  );
}
