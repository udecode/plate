import React from 'react';

import type { MenuProps, setAction } from '../types';

import { Ariakit } from '../lib';
import { useOnClickOutside } from '../utils/useOnClickOutside';

export const SearchableContext = React.createContext(false);

export const ActionContext = React.createContext<setAction | null>(null);

export const useMenu = ({
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
  ref,
  searchValue,
  setAction,
  store,
  values,
  onClickOutside,
  onOpenChange,
  onRootMenuClose,
  onValueChange,
  onValuesChange,
  ...props
}: MenuProps & { ref: React.ForwardedRef<HTMLDivElement> }) => {
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
  };

  const menuProps = {
    flip,
    getAnchorRect,
    gutter: isRootMenu ? 0 : 4,
    portal,
    ref: isRootMenu ? menuRef : undefined,
    unmountOnHide: true,
  };

  const comboboxProviderProps = {
    includesBaseElement: false,
    resetValueOnHide: true,
    setValue: onValueChange,
    value: searchValue,
  };

  return {
    ParentSetAction,
    comboboxProviderProps,
    isDraggleButtonMenu,
    isRootMenu,
    menuButtonProps,
    menuProps,
    menuProviderProps,
    searchable,
  };
};
