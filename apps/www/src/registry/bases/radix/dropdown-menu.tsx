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

export function DropdownMenu({
  modal = true,
  ...props
}: React.ComponentProps<typeof ShadcnDropdownMenu>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    props.defaultOpen ?? false
  );
  const root = useMenuRoot(modal, props.open ?? uncontrolledOpen);

  return (
    <MenuRootContext.Provider value={root}>
      <ShadcnDropdownMenu
        {...props}
        modal={modal}
        onOpenChange={(open) => {
          setUncontrolledOpen(open);
          props.onOpenChange?.(open);
        }}
      />
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
  ref,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  const root = React.useContext(MenuRootContext);
  const triggerRef = useComposedRef(ref, root?.triggerRef);

  return (
    <ShadcnDropdownMenuTrigger {...props} ref={triggerRef} asChild>
      {children}
    </ShadcnDropdownMenuTrigger>
  );
}
