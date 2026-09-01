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

export function ContextMenu(
  props: React.PropsWithChildren<{ modal?: boolean }>
) {
  return <ShadcnContextMenu {...props} />;
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
  return (
    <ShadcnContextMenuTrigger {...props} asChild>
      {children}
    </ShadcnContextMenuTrigger>
  );
}
