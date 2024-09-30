'use client';

import * as React from 'react';

import type { Action, MenuItemProps, MenuProps } from '@udecode/plate-menu';

import { cn } from '@udecode/cn';
import {
  ActionContext,
  Ariakit,
  SearchableContext,
  useMenu,
  useMenuItem,
} from '@udecode/plate-menu';
import { cva } from 'class-variance-authority';

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

type variant = 'ai' | 'default';

type StyledMenuProps = MenuProps & {
  variant: variant;
};

export const Menu = React.forwardRef<HTMLDivElement, StyledMenuProps>(
  function BaseMenu({ variant, ...props }, ref) {
    const {
      ParentSetAction,
      comboboxProviderProps,
      isDraggleButtonMenu,
      isRootMenu,
      menuButtonProps,
      menuProps,
      menuProviderProps,
      searchable,
    } = useMenu({
      ref,
      ...props,
    });

    const menuContent = (
      <Ariakit.MenuProvider {...menuProviderProps}>
        <Ariakit.MenuButton
          className={cn(isRootMenu && !isDraggleButtonMenu && 'hidden')}
          render={
            isRootMenu ? (
              props.dragButton
            ) : (
              <MenuItem render={props.dragButton} />
            )
          }
          {...menuButtonProps}
        >
          {props.icon}
          <span>{props.label}</span>
          <Ariakit.MenuButtonArrow className="ml-auto text-muted-foreground" />
        </Ariakit.MenuButton>

        <Ariakit.Menu
          className={cn(
            menuVariants({ variant }),
            props.className,
            searchable && ''
          )}
          {...menuProps}
        >
          {props.open && isRootMenu && props.injectAboveMenu}
          <ActionContext.Provider value={props.setAction ?? ParentSetAction}>
            <SearchableContext.Provider value={searchable}>
              {searchable ? (
                props.loading ? (
                  <React.Fragment>
                    {props.loadingPlaceholder ?? <div>loading...</div>}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div
                      className={cn(
                        comboboxVariants({ variant }),
                        props.comboboxClassName
                      )}
                    >
                      <Ariakit.Combobox render={props.combobox} autoSelect />
                      {props.comboboxSubmitButton && props.comboboxSubmitButton}
                    </div>
                    <Ariakit.ComboboxList
                      className={cn(
                        comboboxListVariants({ variant }),
                        props.comboboxListClassName
                      )}
                    >
                      {props.children}
                    </Ariakit.ComboboxList>
                  </React.Fragment>
                )
              ) : (
                props.children
              )}
            </SearchableContext.Provider>
          </ActionContext.Provider>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    );

    return searchable ? (
      <Ariakit.ComboboxProvider {...comboboxProviderProps}>
        {menuContent}
      </Ariakit.ComboboxProvider>
    ) : (
      menuContent
    );
  }
);

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

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ className, ...props }, ref) {
    const {
      baseProps,
      comboboxProps,
      isCheckable,
      isChecked,
      isRadio,
      radioProps,
      searchable,
    } = useMenuItem({
      ...props,
      ref,
    });

    const baseClassName = cn(
      menuItemVariants(),
      props.shortcut && 'justify-between',
      className
    );

    baseProps.children = (
      <>
        <div className="flex items-center gap-2">
          {props.icon}
          {baseProps.children ?? props.label}
        </div>

        {(props.shortcut || isCheckable) && (
          <div className="flex items-center">
            {isCheckable && (
              <Ariakit.MenuItemCheck className="ml-2" checked={isChecked} />
            )}
            {props.shortcut && <MenuShortcut>{props.shortcut}</MenuShortcut>}
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
      return isRadio ? (
        <Ariakit.MenuItemRadio className={baseClassName} {...radioProps} />
      ) : (
        <Ariakit.MenuItem className={baseClassName} {...baseProps} />
      );
    }

    return (
      <Ariakit.ComboboxItem
        className={baseClassName}
        {...baseProps}
        {...comboboxProps}
      />
    );
  }
);

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
