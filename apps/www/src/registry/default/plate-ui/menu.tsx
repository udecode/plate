'use client';

import * as React from 'react';

import * as Ariakit from '@ariakit/react';
import { cn } from '@udecode/cn';
import { cva } from 'class-variance-authority';
import { matchSorter } from 'match-sorter';

const menuVariants = cva(
  'z-50 overflow-auto text-popover-foreground outline-none',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        ai: 'min-h-[380px] bg-inherit',
        default: 'rounded-md border bg-popover p-0',
      },
    },
  }
);

const menuItemVariants = cva(
  'relative flex min-w-40 cursor-pointer select-none items-center gap-2 px-2 py-1.5 text-sm text-accent-foreground outline-none hover:bg-accent focus:bg-accent focus:text-accent-foreground  aria-[expanded=true]:bg-accent aria-[selected=true]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        ai: '',
        default: 'rounded-sm',
      },
    },
  }
);

export const comboboxVariants = cva('overflow-hidden', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      ai: 'mb-2 flex min-w-[320px] rounded-sm border bg-popover p-2 shadow sm:w-[408px] md:w-[508px] lg:w-[608px] xl:w-[708px]',
      default: 'mb-0 p-2',
    },
  },
});

const comboboxListVariants = cva('rounded-sm', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      ai: 'w-[320px] border bg-white p-0',
      default: '',
    },
  },
});

export interface Action {
  group?: string;
  groupName?: string;
  icon?: React.ReactNode;
  items?: Action[];
  keywords?: string[];
  label?: string;
  shortcut?: string;
  value?: string;
}

export type actionGroup = {
  group?: string;
  value?: string;
};

export interface MenuProps extends Ariakit.MenuButtonProps<'div'> {
  combobox?: Ariakit.ComboboxProps['render'];
  comboboxClassName?: string;
  comboboxListClassName?: string;
  comboboxSubmitButton?: React.ReactElement;
  dragButton?: Ariakit.MenuButtonProps['render'];
  flip?: boolean;
  getAnchorRect?: Ariakit.MenuProps['getAnchorRect'];
  icon?: React.ReactNode;
  injectAboveMenu?: React.ReactElement;
  label?: React.ReactNode;
  loading?: boolean;
  loadingPlaceholder?: React.ReactNode;
  onClickOutside?: (event: MouseEvent) => void;
  onOpenChange?: (open: boolean) => void;
  onRootMenuClose?: () => void;
  onValueChange?: (value: string) => void;
  onValuesChange?: Ariakit.MenuProviderProps['setValues'];
  open?: boolean;
  placement?: Ariakit.MenuProviderProps['placement'];
  portal?: Ariakit.MenuProps['portal'];
  searchValue?: string;
  setAction?: setAction;
  values?: Ariakit.MenuProviderProps['values'];
  variant?: variant;
}

const SearchableContext = React.createContext(false);

type setAction = (actionGroup: actionGroup) => void;
const ActionContext = React.createContext<setAction | null>(null);

type variant = 'ai' | 'default';

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    children,
    combobox,
    comboboxClassName,
    comboboxListClassName,
    comboboxSubmitButton,
    dragButton,
    flip = true,
    getAnchorRect,
    icon,
    injectAboveMenu,
    label,
    loading,
    loadingPlaceholder,
    open,
    placement,
    portal,
    searchValue,
    setAction,
    store,
    values,
    variant,
    onClickOutside,
    onOpenChange,
    onRootMenuClose,
    onValueChange,
    onValuesChange,
    ...props
  },
  ref
) {
  const parent = Ariakit.useMenuContext();
  const searchable = searchValue != null || !!onValueChange || !!combobox;
  const ParentSetAction = React.useContext(ActionContext);

  const isRootMenu = !parent;
  const isDraggleButtonMenu = !!dragButton;
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  useOnClickOutside(menuRef, onClickOutside);

  const menuProviderProps = {
    open,
    placement: isRootMenu ? placement : 'right',
    setOpen: (v: boolean) => {
      onOpenChange?.(v);

      if (!v && !parent && !dragButton) onRootMenuClose?.();
    },
    setValues: onValuesChange,
    showTimeout: 100,
    store,
    values,
  };

  const menuButtonProps = {
    ref,
    ...props,
    className: cn(isRootMenu && !isDraggleButtonMenu && 'hidden'),
    render: isRootMenu ? dragButton : <MenuItem render={dragButton} />,
  };

  const menuProps = {
    className: cn(menuVariants({ variant }), props.className, searchable && ''),
    flip,
    getAnchorRect,
    gutter: isRootMenu ? 0 : 4,
    portal,
    ref: isRootMenu ? menuRef : undefined,
    unmountOnHide: true,
  };

  const menuContent = (
    <Ariakit.MenuProvider {...menuProviderProps}>
      <Ariakit.MenuButton {...menuButtonProps}>
        {icon}
        <span>{label}</span>
        <Ariakit.MenuButtonArrow className="ml-auto text-muted-foreground" />
      </Ariakit.MenuButton>

      <Ariakit.Menu {...menuProps}>
        {open && isRootMenu && injectAboveMenu}
        <ActionContext.Provider value={setAction ?? ParentSetAction}>
          <SearchableContext.Provider value={searchable}>
            {searchable ? (
              loading ? (
                <React.Fragment>
                  {loadingPlaceholder ?? <div>loading...</div>}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div
                    className={cn(
                      comboboxVariants({ variant }),
                      comboboxClassName
                    )}
                  >
                    <Ariakit.Combobox render={combobox} autoSelect />
                    {comboboxSubmitButton && comboboxSubmitButton}
                  </div>
                  <Ariakit.ComboboxList
                    className={cn(
                      comboboxListVariants({ variant }),
                      comboboxListClassName
                    )}
                  >
                    {children}
                  </Ariakit.ComboboxList>
                </React.Fragment>
              )
            ) : (
              children
            )}
          </SearchableContext.Provider>
        </ActionContext.Provider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );

  const comboboxProviderProps = {
    includesBaseElement: false,
    resetValueOnHide: true,
    setValue: onValueChange,
    value: searchValue,
  };

  return searchable ? (
    <Ariakit.ComboboxProvider {...comboboxProviderProps}>
      {menuContent}
    </Ariakit.ComboboxProvider>
  ) : (
    menuContent
  );
});

export interface MenuSeparatorProps extends Ariakit.MenuSeparatorProps {}

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
>(function MenuSeparator(props, ref) {
  return (
    <Ariakit.MenuSeparator
      ref={ref}
      {...props}
      className={cn(props.className)}
    />
  );
});

export interface MenuGroupProps extends Ariakit.MenuGroupProps {
  label?: React.ReactNode;
  variant?: variant;
}

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup({ label, variant, ...props }, ref) {
    return (
      <Ariakit.MenuGroup
        ref={ref}
        {...props}
        className={cn('group pb-1.5', props.className)}
      >
        {label && (
          <Ariakit.MenuGroupLabel className="px-2 py-1.5 pt-2 text-xs font-semibold text-muted-foreground">
            {label}
          </Ariakit.MenuGroupLabel>
        )}
        {props.children}
      </Ariakit.MenuGroup>
    );
  }
);

export interface MenuShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const MenuShortcut = React.forwardRef<
  HTMLSpanElement,
  MenuShortcutProps
>(function MenuShortcut(props, ref) {
  return (
    <span
      ref={ref}
      {...props}
      className={cn('text-xs text-muted-foreground', props.className)}
    />
  );
});

export interface MenuItemProps
  extends Omit<Ariakit.ComboboxItemProps, 'store'> {
  group?: string;
  icon?: React.ReactNode;
  label?: string;
  name?: string;
  parentGroup?: string;
  preventClose?: boolean;
  shortcut?: string;
  value?: string;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(
    {
      className,
      group,
      icon,
      label,
      name,
      parentGroup,
      preventClose,
      shortcut,
      value,
      ...props
    },
    ref
  ) {
    const menu = Ariakit.useMenuContext();

    if (!menu) throw new Error('MenuItem should be used inside a Menu');

    const setAction = React.useContext(ActionContext);

    const searchable = React.useContext(SearchableContext);

    const baseOnClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      props.onClick?.(event);

      if (event.isDefaultPrevented()) return;
      if (setAction === null)
        console.warn('Did you forget to pass the setAction prop?');

      setAction?.({ group, value });
    };

    const baseProps: MenuItemProps = {
      blurOnHoverEnd: false,
      focusOnHover: true,
      label,
      ref,
      ...props,
      className: cn(
        menuItemVariants(),
        shortcut && 'justify-between',
        className
      ),
      group: parentGroup,
      name: group,
      value: value || label,
      onClick: baseOnClick,
    };

    const isCheckable = menu.useState((state) => {
      if (!group) return false;
      if (value == null) return false;

      return state.values[group] != null;
    });

    const isChecked = menu.useState((state) => {
      if (!group) return false;

      return state.values[group] === value;
    });

    baseProps.children = (
      <>
        <div className="flex items-center gap-2">
          {icon}
          {baseProps.children ?? label}
        </div>

        {(shortcut || isCheckable) && (
          <div className="flex items-center">
            {isCheckable && (
              <Ariakit.MenuItemCheck className="ml-2" checked={isChecked} />
            )}
            {shortcut && <MenuShortcut>{shortcut}</MenuShortcut>}
            {isCheckable && searchable && (
              <Ariakit.VisuallyHidden>
                {isChecked ? 'checked' : 'not checked'}
              </Ariakit.VisuallyHidden>
            )}
          </div>
        )}
      </>
    );

    if (!searchable) {
      if (name != null && value != null) {
        const radioProps = { ...baseProps, hideOnClick: true, name, value };

        return <Ariakit.MenuItemRadio {...radioProps} />;
      }

      return <Ariakit.MenuItem {...baseProps} />;
    }

    const hideOnClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const expandable = event.currentTarget.hasAttribute('aria-expanded');

      if (expandable) return false;
      if (preventClose) return false;

      menu.hideAll();

      return false;
    };

    const selectValueOnClick = () => {
      if (name == null || value == null) return false;

      menu.setValue(name, value);

      return true;
    };

    return (
      <Ariakit.ComboboxItem
        {...baseProps}
        value={isCheckable ? value : undefined}
        hideOnClick={hideOnClick}
        selectValueOnClick={selectValueOnClick}
        setValueOnClick={false}
      />
    );
  }
);

export function filterAndBuildMenuTree(
  actions: Action[],
  searchValue: string
): Action[] | null {
  if (!searchValue) return null;

  const options = flattenMenuTree(actions);

  const matches = matchSorter(options, searchValue, {
    keys: ['label', 'group', 'value', 'keywords'],
  });

  return buildMenuTree(matches.slice(0, 15));
}

export function flattenMenuTree(actions: Action[]): Action[] {
  return actions.flatMap((item) => {
    if (item.items) {
      const parentGroup = item.group ?? item.label;
      const groupName = item.label;

      return flattenMenuTree(
        item.items.map(({ group, ...item }) => ({
          ...item,
          group: group ?? parentGroup,
          groupName,
        }))
      );
    }

    return item;
  });
}

export function buildMenuTree(actions: Action[] | null) {
  if (!actions) return null;

  return actions.reduce<Action[]>((actions, option) => {
    if (option.groupName) {
      const groupName = actions.find(
        (action) => action.label === option.groupName
      );

      if (groupName) {
        groupName.items!.push(option);
      } else {
        actions.push({ items: [option], label: option.groupName });
      }
    } else {
      actions.push(option);
    }

    return actions;
  }, []);
}

export function renderMenuItems({
  group,
  items,
}: {
  items: Action[];
  group?: string;
}) {
  return items.map((item, index) => {
    const value = item.value || item.label;
    const separator = !!items[index - 1]?.items || (item.items && index > 0);

    const element = item.items ? (
      <MenuGroup label={item.groupName ?? item.label}>
        {renderMenuItems({ group: item.group, items: item.items })}
      </MenuGroup>
    ) : (
      <MenuItem
        name={item.group}
        value={item.value || item.label}
        label={item.label}
        group={group}
        icon={item.icon}
        shortcut={item.shortcut}
      />
    );

    return (
      <React.Fragment key={value}>
        {separator && <MenuSeparator />}
        {element}
      </React.Fragment>
    );
  });
}

interface renderMatchesOptions {
  hiddenOnEmpty: boolean;
}

export function renderSearchMenuItems(
  matches: Action[] | null,
  options?: renderMatchesOptions
) {
  if (!matches) return null;
  if (matches.length === 0) {
    if (options?.hiddenOnEmpty) return <></>;

    return <div className={cn(menuItemVariants())}>No results</div>;
  }

  return renderMenuItems({ items: matches });
}

export * as Ariakit from '@ariakit/react';

// Utils ---------------------------------------------------------------

import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Determines the appropriate effect hook to use based on the environment. If
 * the code is running on the client-side (browser), it uses the
 * `useLayoutEffect` hook, otherwise, it uses the `useEffect` hook.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

// MediaQueryList Event based useEventListener interface
function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: React.RefObject<MediaQueryList>,
  options?: AddEventListenerOptions | boolean
): void;

// Window Event based useEventListener interface
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: AddEventListenerOptions | boolean
): void;

// Element Event based useEventListener interface
function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<T>,
  options?: AddEventListenerOptions | boolean
): void;

// Document Event based useEventListener interface
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: React.RefObject<Document>,
  options?: AddEventListenerOptions | boolean
): void;

// https://usehooks-ts.com/react-hook/use-event-listener
function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KM extends keyof MediaQueryListEventMap,
  T extends HTMLElement | MediaQueryList | void = void,
>(
  eventName: KH | KM | KW,
  handler: (
    event:
      | Event
      | HTMLElementEventMap[KH]
      | MediaQueryListEventMap[KM]
      | WindowEventMap[KW]
  ) => void,
  element?: React.RefObject<T>,
  options?: AddEventListenerOptions | boolean
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current ?? window;

    if (!(targetElement && targetElement.addEventListener)) return;

    // Create event listener that calls handler function stored in ref
    const listener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, listener, options);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

type Handler = (event: MouseEvent) => void;

/**
 * Attaches an event listener to detect clicks that occur outside a given
 * element.
 *
 * @template T - The type of HTMLElement that the ref is referring to.
 * @param {RefObject<T>} ref - A React ref object that points to the element to
 *   listen for clicks outside of.
 * @param {Handler} handler - The callback function to be executed when a click
 *   occurs outside the element.
 * @param {string} [mouseEvent='mousedown'] - The type of mouse event to listen
 *   for (e.g., 'mousedown', 'mouseup'). Default is `'mousedown'`
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler?: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void => {
  useEventListener(mouseEvent, (event) => {
    if (!handler) return;

    const el = ref?.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event);
  });
};
