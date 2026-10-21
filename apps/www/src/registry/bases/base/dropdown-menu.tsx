'use client';

import type { Menu as BaseMenuPrimitive } from '@base-ui/react/menu';
import { useComposedRef } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  CloseFocusWatcher,
  type FinalFocus,
  FinalFocusContext,
  type FinalFocusRef,
  focusClaimed,
  MenuRootContext,
  takeFinalFocus,
  useMenuRoot,
} from '@/registry/components/editor/menu-close-focus';

type BaseDropdownMenuContentProps = BaseMenuPrimitive.Popup.Props &
  Pick<
    BaseMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

const BaseDropdownMenu =
  ShadcnDropdownMenu as React.ComponentType<BaseMenuPrimitive.Root.Props>;
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

export function DropdownMenu({
  modal = true,
  ...props
}: BaseMenuPrimitive.Root.Props) {
  const root = useMenuRoot(modal);
  const { finalFocusRef } = root;

  React.useEffect(() => {
    if (props.open) finalFocusRef.current = undefined;
  }, [finalFocusRef, props.open]);

  return (
    <MenuRootContext.Provider value={root}>
      <BaseDropdownMenu {...props} modal={modal} />
    </MenuRootContext.Provider>
  );
}

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
  children,
  className,
  onBlurCapture,
  onFinalFocus,
  onFocusCapture,
  ref,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onAbort'> & {
  align?: 'center' | 'end' | 'start';
  alignOffset?: number;
  onFinalFocus?: (event: Event) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
}) {
  const root = React.useContext(MenuRootContext);
  const contentFinalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const finalFocusRef = root?.finalFocusRef ?? contentFinalFocusRef;
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = useComposedRef(ref, popupRef);
  // React focus events propagate out of a submenu's portal, so focus in a submenu still counts as inside the menu.
  const focusInside = React.useRef(false);

  return (
    <FinalFocusContext.Provider value={finalFocusRef}>
      <BaseDropdownMenuContent
        {...props}
        ref={contentRef}
        className={cn('data-closed:!animate-none', className)}
        onBlurCapture={(event) => {
          focusInside.current = false;
          onBlurCapture?.(event);
        }}
        onFocusCapture={(event) => {
          focusInside.current = true;
          onFocusCapture?.(event);
        }}
        finalFocus={() => {
          const finalFocus = takeFinalFocus(finalFocusRef);
          const inside = focusInside.current;

          focusInside.current = false;
          if (finalFocus) {
            finalFocus();

            return false;
          }
          // Base UI skips its moved-focus check when finalFocus is a function, so the adapter makes that check itself.
          if (
            finalFocus === false ||
            (root && !inside && focusClaimed(root.triggerRef.current))
          ) {
            return false;
          }
          if (onFinalFocus) {
            const event = new Event('closeAutoFocus', { cancelable: true });
            onFinalFocus(event);

            return !event.defaultPrevented;
          }
          return true;
        }}
      >
        {root && <CloseFocusWatcher popupRef={popupRef} root={root} />}
        {children}
      </BaseDropdownMenuContent>
    </FinalFocusContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  ref,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  const root = React.useContext(MenuRootContext);
  const triggerRef = useComposedRef(ref, root?.triggerRef);

  return (
    <BaseDropdownMenuTrigger {...props} ref={triggerRef} render={children} />
  );
}
