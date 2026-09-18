'use client';

import type { Menu as BaseMenuPrimitive } from '@base-ui/react/menu';
import * as React from 'react';

import {
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BaseDropdownMenuContentProps = BaseMenuPrimitive.Popup.Props &
  Pick<
    BaseMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

const BaseDropdownMenuContent =
  ShadcnDropdownMenuContent as React.ComponentType<BaseDropdownMenuContentProps>;
const BaseDropdownMenuItem = ShadcnDropdownMenuItem as React.ComponentType<
  BaseMenuPrimitive.Item.Props & {
    inset?: boolean;
    ref?: React.Ref<HTMLElement>;
    variant?: 'default' | 'destructive';
  }
>;
const BaseDropdownMenuCheckboxItem =
  ShadcnDropdownMenuCheckboxItem as React.ComponentType<
    BaseMenuPrimitive.CheckboxItem.Props & {
      ref?: React.Ref<HTMLElement>;
    }
  >;
const BaseDropdownMenuRadioItem =
  ShadcnDropdownMenuRadioItem as React.ComponentType<
    BaseMenuPrimitive.RadioItem.Props & {
      ref?: React.Ref<HTMLElement>;
    }
  >;
const BaseDropdownMenuTrigger =
  ShadcnDropdownMenuTrigger as React.ComponentType<BaseMenuPrimitive.Trigger.Props>;

// biome-ignore lint/performance/noBarrelFile: This adapter owns one stable menu API across registry bases.
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

type SelectEventHandler = (event: Event) => void;
type BaseUIEvent = React.MouseEvent<HTMLElement> & {
  preventBaseUIHandler?: () => void;
};

function dispatchSelect(
  onSelect: SelectEventHandler | undefined,
  event: BaseUIEvent
) {
  if (!onSelect) return;

  const selectEvent = new Event('select', { cancelable: true });
  onSelect(selectEvent);

  if (selectEvent.defaultPrevented) event.preventBaseUIHandler?.();
}

export function DropdownMenuItem({
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnDropdownMenuItem>,
  'onClick' | 'onSelect'
> &
  Pick<BaseMenuPrimitive.Item.Props, 'onClick'> & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseDropdownMenuItem
      {...props}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
      }}
    />
  );
}

export function DropdownMenuCheckboxItem({
  closeOnClick = true,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnDropdownMenuCheckboxItem>,
  'checked' | 'closeOnClick' | 'onClick' | 'onSelect'
> &
  Pick<
    BaseMenuPrimitive.CheckboxItem.Props,
    'checked' | 'closeOnClick' | 'onClick'
  > & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseDropdownMenuCheckboxItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
      }}
    />
  );
}

export function DropdownMenuRadioItem({
  closeOnClick = true,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnDropdownMenuRadioItem>,
  'closeOnClick' | 'onClick' | 'onSelect'
> &
  Pick<BaseMenuPrimitive.RadioItem.Props, 'closeOnClick' | 'onClick'> & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseDropdownMenuRadioItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
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
