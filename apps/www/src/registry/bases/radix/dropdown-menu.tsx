'use client';

import * as React from 'react';

import {
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export {
  DropdownMenu,
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

const FinalFocusContext = React.createContext<FinalFocusRef | null>(null);

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
  onFinalFocus,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);

  return (
    <FinalFocusContext.Provider value={finalFocusRef}>
      <ShadcnDropdownMenuContent
        {...props}
        onCloseAutoFocus={(event) => {
          const finalFocus = finalFocusRef.current;

          finalFocusRef.current = undefined;

          if (finalFocus === false) {
            event.preventDefault();

            return;
          }
          if (finalFocus) {
            event.preventDefault();
            finalFocus();

            return;
          }
          onFinalFocus?.(event);
        }}
      />
    </FinalFocusContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  return (
    <ShadcnDropdownMenuTrigger {...props} asChild>
      {children}
    </ShadcnDropdownMenuTrigger>
  );
}
