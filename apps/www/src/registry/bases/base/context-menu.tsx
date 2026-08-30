'use client';

import type { ContextMenu as BaseContextMenuPrimitive } from '@base-ui/react/context-menu';
import * as React from 'react';

import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuContent as ShadcnContextMenuContent,
  ContextMenuTrigger as ShadcnContextMenuTrigger,
} from '@/components/ui/context-menu';

type BaseContextMenuContentProps = BaseContextMenuPrimitive.Popup.Props &
  Pick<
    BaseContextMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

const BaseContextMenuContent =
  ShadcnContextMenuContent as React.ComponentType<BaseContextMenuContentProps>;
const BaseContextMenuTrigger =
  ShadcnContextMenuTrigger as React.ComponentType<BaseContextMenuPrimitive.Trigger.Props>;

// biome-ignore lint/performance/noBarrelFile: This adapter owns one stable menu API across registry bases.
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

export function ContextMenu({ children }: ContextMenuProps) {
  return <ShadcnContextMenu>{children}</ShadcnContextMenu>;
}

export function ContextMenuContent({
  onFinalFocus,
  ...props
}: ContextMenuContentProps) {
  return (
    <BaseContextMenuContent
      {...props}
      finalFocus={
        onFinalFocus
          ? () => {
              const event = new Event('closeAutoFocus', { cancelable: true });
              onFinalFocus(event);

              return !event.defaultPrevented;
            }
          : undefined
      }
    />
  );
}

export function ContextMenuTrigger({
  children,
  ...props
}: ContextMenuTriggerProps) {
  return <BaseContextMenuTrigger {...props} render={children} />;
}
