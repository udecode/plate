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

type ContextMenuProps = React.PropsWithChildren<{ modal?: boolean }>;

type ContextMenuContentProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'onAbort'
> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
};

type ContextMenuTriggerProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  children: React.ReactElement;
};

export function ContextMenu(props: ContextMenuProps) {
  return <ShadcnContextMenu {...props} />;
}

export function ContextMenuContent({
  onFinalFocus,
  ...props
}: ContextMenuContentProps) {
  return (
    <ShadcnContextMenuContent {...props} onCloseAutoFocus={onFinalFocus} />
  );
}

export function ContextMenuTrigger({
  children,
  ...props
}: ContextMenuTriggerProps) {
  return (
    <ShadcnContextMenuTrigger {...props} asChild>
      {children}
    </ShadcnContextMenuTrigger>
  );
}
