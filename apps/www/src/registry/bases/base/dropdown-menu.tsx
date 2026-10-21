'use client';

import type { Menu as BaseMenuPrimitive } from '@base-ui/react/menu';
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
type FinalFocus = false | (() => void);
type BaseUIEvent = React.MouseEvent<HTMLElement> & {
  preventBaseUIHandler?: () => void;
};
type FinalFocusRef = React.RefObject<FinalFocus | undefined>;
type MenuRoot = {
  finalFocusRef: FinalFocusRef;
  modal: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const FinalFocusContext = React.createContext<FinalFocusRef | null>(null);
const MenuRootContext = React.createContext<MenuRoot | null>(null);
const closeGestures = ['keydown', 'pointerdown'] as const;

function isSecondaryPress(event: Event) {
  return (
    event instanceof MouseEvent &&
    (event.button === 2 || (event.button === 0 && event.ctrlKey))
  );
}

function ownsGesture(event: Event, trigger: HTMLElement | null) {
  const owner = trigger?.closest('[role="toolbar"]') ?? trigger;

  return event
    .composedPath()
    .some(
      (node) =>
        node instanceof Element &&
        (node === owner || node.matches('[role="menu"]'))
    );
}

function gestureFinalFocus(
  event: Event,
  { modal, triggerRef }: MenuRoot
): FinalFocus | undefined {
  if (event instanceof KeyboardEvent) {
    return event.key === 'Tab' ? false : undefined;
  }
  if (isSecondaryPress(event)) return false;
  if (ownsGesture(event, triggerRef.current)) return undefined;

  return modal ? undefined : false;
}

function focusClaimed(trigger: HTMLElement | null) {
  let active = document.activeElement;

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }

  return !!active && active !== document.body && !trigger?.contains(active);
}

function CloseFocusWatcher({
  popupRef,
  root,
}: {
  popupRef: React.RefObject<HTMLDivElement | null>;
  root: MenuRoot;
}) {
  React.useEffect(() => {
    const record = (event: Event) => {
      // Base calls finalFocus only when a closed popup unmounts, a frame or more later, so a gesture in between must not replace the close's intent.
      if (popupRef.current?.hasAttribute('data-open')) {
        root.finalFocusRef.current = gestureFinalFocus(event, root);
      }
    };

    for (const type of closeGestures) {
      window.addEventListener(type, record, true);
    }

    return () => {
      for (const type of closeGestures) {
        window.removeEventListener(type, record, true);
      }
    };
  }, [popupRef, root]);

  return null;
}

export function DropdownMenu({
  modal = true,
  ...props
}: BaseMenuPrimitive.Root.Props) {
  const finalFocusRef = React.useRef<FinalFocus | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const root = React.useMemo(
    () => ({ finalFocusRef, modal, triggerRef }),
    [modal]
  );

  React.useEffect(() => {
    if (props.open) finalFocusRef.current = undefined;
  }, [props.open]);

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
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'onAbort'> & {
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
  // React focus events propagate out of a submenu's portal, so focus in a submenu still counts as inside the menu.
  const focusInside = React.useRef(false);

  return (
    <FinalFocusContext.Provider value={finalFocusRef}>
      <BaseDropdownMenuContent
        {...props}
        ref={popupRef}
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
          const finalFocus = finalFocusRef.current;
          const inside = focusInside.current;

          finalFocusRef.current = undefined;
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
  ...props
}: Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & {
  children: React.ReactElement;
}) {
  const root = React.useContext(MenuRootContext);

  return (
    <BaseDropdownMenuTrigger
      {...props}
      ref={root?.triggerRef}
      render={children}
    />
  );
}
