'use client';

import * as React from 'react';

import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuContent as ShadcnContextMenuContent,
  ContextMenuTrigger as ShadcnContextMenuTrigger,
} from '@/components/ui/context-menu';

export {
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

const ContextMenuDisabledContext = React.createContext(false);

export function ContextMenu({
  disabled = false,
  ...props
}: React.PropsWithChildren<{ disabled?: boolean; modal?: boolean }>) {
  return (
    <ContextMenuDisabledContext value={disabled}>
      <ShadcnContextMenu {...props} />
    </ContextMenuDisabledContext>
  );
}

export function ContextMenuContent({
  onFinalFocus,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  return (
    <ShadcnContextMenuContent {...props} onCloseAutoFocus={onFinalFocus} />
  );
}

export function ContextMenuTrigger({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: React.ReactElement;
}) {
  const disabled = React.useContext(ContextMenuDisabledContext);

  return (
    <ShadcnContextMenuTrigger {...props} asChild disabled={disabled}>
      {children}
    </ShadcnContextMenuTrigger>
  );
}
