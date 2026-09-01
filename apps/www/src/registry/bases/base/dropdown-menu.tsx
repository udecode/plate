'use client';

import type { Menu as BaseMenuPrimitive } from '@base-ui/react/menu';
import * as React from 'react';

import {
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BaseDropdownMenuContentProps = BaseMenuPrimitive.Popup.Props &
  Pick<
    BaseMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

const BaseDropdownMenuContent =
  ShadcnDropdownMenuContent as React.ComponentType<BaseDropdownMenuContentProps>;
const BaseDropdownMenuTrigger =
  ShadcnDropdownMenuTrigger as React.ComponentType<BaseMenuPrimitive.Trigger.Props>;

// biome-ignore lint/performance/noBarrelFile: This adapter owns one stable menu API across registry bases.
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
  return (
    <BaseDropdownMenuContent
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

export function DropdownMenuTrigger({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  return <BaseDropdownMenuTrigger {...props} render={children} />;
}
