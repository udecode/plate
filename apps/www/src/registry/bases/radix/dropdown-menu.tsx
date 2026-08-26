'use client';

import * as React from 'react';

import {
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

type DropdownMenuContentProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'onAbort'
> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
};

type DropdownMenuTriggerProps = Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'children'
> & {
  children: React.ReactElement;
};

export function DropdownMenuContent({
  onFinalFocus,
  ...props
}: DropdownMenuContentProps) {
  return (
    <ShadcnDropdownMenuContent {...props} onCloseAutoFocus={onFinalFocus} />
  );
}

export function DropdownMenuTrigger({
  children,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <ShadcnDropdownMenuTrigger {...props} asChild>
      {children}
    </ShadcnDropdownMenuTrigger>
  );
}
