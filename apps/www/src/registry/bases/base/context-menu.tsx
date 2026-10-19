'use client';

import type { ContextMenu as BaseContextMenuPrimitive } from '@base-ui/react/context-menu';
import * as React from 'react';

import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuCheckboxItem as ShadcnContextMenuCheckboxItem,
  ContextMenuContent as ShadcnContextMenuContent,
  ContextMenuItem as ShadcnContextMenuItem,
  ContextMenuRadioItem as ShadcnContextMenuRadioItem,
  ContextMenuTrigger as ShadcnContextMenuTrigger,
} from '@/components/ui/context-menu';

type BaseContextMenuContentProps = BaseContextMenuPrimitive.Popup.Props &
  Pick<
    BaseContextMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

const BaseContextMenuContent =
  ShadcnContextMenuContent as React.ComponentType<BaseContextMenuContentProps>;
const BaseContextMenuItem = ShadcnContextMenuItem as React.ComponentType<
  BaseContextMenuPrimitive.Item.Props & {
    inset?: boolean;
    ref?: React.Ref<HTMLElement>;
    variant?: 'default' | 'destructive';
  }
>;
const BaseContextMenuCheckboxItem =
  ShadcnContextMenuCheckboxItem as React.ComponentType<
    BaseContextMenuPrimitive.CheckboxItem.Props & {
      ref?: React.Ref<HTMLElement>;
    }
  >;
const BaseContextMenuRadioItem =
  ShadcnContextMenuRadioItem as React.ComponentType<
    BaseContextMenuPrimitive.RadioItem.Props & {
      ref?: React.Ref<HTMLElement>;
    }
  >;
const BaseContextMenuTrigger =
  ShadcnContextMenuTrigger as React.ComponentType<BaseContextMenuPrimitive.Trigger.Props>;
const BaseContextMenu =
  ShadcnContextMenu as React.ComponentType<BaseContextMenuPrimitive.Root.Props>;

// biome-ignore lint/performance/noBarrelFile: This adapter owns one stable menu API across registry bases.
export {
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

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

export function ContextMenuItem({
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnContextMenuItem>,
  'onClick' | 'onSelect'
> &
  Pick<BaseContextMenuPrimitive.Item.Props, 'onClick'> & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseContextMenuItem
      {...props}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
      }}
    />
  );
}

export function ContextMenuCheckboxItem({
  closeOnClick = true,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnContextMenuCheckboxItem>,
  'checked' | 'closeOnClick' | 'onClick' | 'onSelect'
> &
  Pick<
    BaseContextMenuPrimitive.CheckboxItem.Props,
    'checked' | 'closeOnClick' | 'onClick'
  > & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseContextMenuCheckboxItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
      }}
    />
  );
}

export function ContextMenuRadioItem({
  closeOnClick = true,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnContextMenuRadioItem>,
  'closeOnClick' | 'onClick' | 'onSelect'
> &
  Pick<BaseContextMenuPrimitive.RadioItem.Props, 'closeOnClick' | 'onClick'> & {
    onSelect?: SelectEventHandler;
  }) {
  return (
    <BaseContextMenuRadioItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        dispatchSelect(onSelect, event);
        onClick?.(event);
      }}
    />
  );
}

export function ContextMenu({
  children,
  disabled,
}: React.PropsWithChildren<{ disabled?: boolean; modal?: boolean }>) {
  return <BaseContextMenu disabled={disabled}>{children}</BaseContextMenu>;
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
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: React.ReactElement;
}) {
  return <BaseContextMenuTrigger {...props} render={children} />;
}
