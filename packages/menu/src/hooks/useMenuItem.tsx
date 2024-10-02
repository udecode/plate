import React from 'react';

import type { MenuItemProps } from '../types';

import { Ariakit } from '../lib';
import { ActionContext, SearchableContext } from './useMenu';

type UseMenuItemProps = MenuItemProps & {
  ref: React.ForwardedRef<HTMLDivElement>;
};

export const useMenuItem = ({
  className,
  group,
  icon,
  label,
  name,
  parentGroup,
  preventClose,
  ref,
  shortcut,
  value,
  ...props
}: UseMenuItemProps) => {
  const menu = Ariakit.useMenuContext();

  if (!menu) throw new Error('MenuItem should be used inside a Menu');

  const setAction = React.useContext(ActionContext);

  const searchable = React.useContext(SearchableContext);

  const baseOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  const isRadio = name != null && value != null;

  const radioProps = {
    ...baseProps,
    hideOnClick: true,
    name: name as string,
    value: value as string,
  };

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

  const comboboxProps = {
    ...baseProps,
    hideOnClick: hideOnClick,
    selectValueOnClick: selectValueOnClick,
    setValueOnClick: selectValueOnClick,
    value: isCheckable ? value : undefined,
  };

  return {
    baseProps,
    comboboxProps,
    isCheckable,
    isChecked,
    isRadio,
    radioProps,
    searchable,
  };
};
