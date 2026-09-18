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
type FinalFocus = false | (() => void);
type BaseUIEvent = React.MouseEvent<HTMLElement> & {
  preventBaseUIHandler?: () => void;
};
type FinalFocusRef = React.MutableRefObject<FinalFocus | undefined>;

const FinalFocusContext = React.createContext<FinalFocusRef | null>(null);

function dispatchSelect(
  onSelect: SelectEventHandler | undefined,
  event: BaseUIEvent
) {
  if (!onSelect) return true;

  const selectEvent = new Event('select', { cancelable: true });
  onSelect(selectEvent);

  if (selectEvent.defaultPrevented) event.preventBaseUIHandler?.();

  return !selectEvent.defaultPrevented;
}

function handleItemClick(
  event: BaseUIEvent,
  {
    closeOnClick,
    finalFocus,
    onClick,
    onSelect,
  }: {
    closeOnClick: boolean;
    finalFocus: FinalFocus | undefined;
    onClick: BaseMenuPrimitive.Item.Props['onClick'];
    onSelect: SelectEventHandler | undefined;
  },
  finalFocusRef: FinalFocusRef | null
) {
  let baseHandlerPrevented = false;
  const { preventBaseUIHandler } = event;

  if (preventBaseUIHandler) {
    event.preventBaseUIHandler = () => {
      baseHandlerPrevented = true;
      preventBaseUIHandler();
    };
  }

  const selectAllowed = dispatchSelect(onSelect, event);
  onClick?.(event as never);

  if (
    closeOnClick &&
    selectAllowed &&
    !baseHandlerPrevented &&
    !event.defaultPrevented &&
    finalFocusRef
  ) {
    finalFocusRef.current = finalFocus;
  }
}

export function DropdownMenuItem({
  closeOnClick = true,
  finalFocus,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnDropdownMenuItem>,
  'onClick' | 'onSelect'
> &
  Pick<BaseMenuPrimitive.Item.Props, 'closeOnClick' | 'onClick'> & {
    finalFocus?: FinalFocus;
    onSelect?: SelectEventHandler;
  }) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <BaseDropdownMenuItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleItemClick(
          event,
          { closeOnClick, finalFocus, onClick, onSelect },
          finalFocusRef
        );
      }}
    />
  );
}

export function DropdownMenuCheckboxItem({
  closeOnClick = true,
  finalFocus,
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
    finalFocus?: FinalFocus;
    onSelect?: SelectEventHandler;
  }) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <BaseDropdownMenuCheckboxItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleItemClick(
          event,
          { closeOnClick, finalFocus, onClick, onSelect },
          finalFocusRef
        );
      }}
    />
  );
}

export function DropdownMenuRadioItem({
  closeOnClick = true,
  finalFocus,
  onClick,
  onSelect,
  ...props
}: Omit<
  React.ComponentProps<typeof ShadcnDropdownMenuRadioItem>,
  'closeOnClick' | 'onClick' | 'onSelect'
> &
  Pick<BaseMenuPrimitive.RadioItem.Props, 'closeOnClick' | 'onClick'> & {
    finalFocus?: FinalFocus;
    onSelect?: SelectEventHandler;
  }) {
  const finalFocusRef = React.useContext(FinalFocusContext);

  return (
    <BaseDropdownMenuRadioItem
      {...props}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleItemClick(
          event,
          { closeOnClick, finalFocus, onClick, onSelect },
          finalFocusRef
        );
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
      <BaseDropdownMenuContent
        {...props}
        finalFocus={() => {
          const finalFocus = finalFocusRef.current;

          finalFocusRef.current = undefined;

          if (finalFocus === false) return false;
          if (finalFocus) {
            finalFocus();

            return false;
          }
          if (onFinalFocus) {
            const event = new Event('closeAutoFocus', { cancelable: true });
            onFinalFocus(event);

            return !event.defaultPrevented;
          }
          return true;
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
  return <BaseDropdownMenuTrigger {...props} render={children} />;
}
