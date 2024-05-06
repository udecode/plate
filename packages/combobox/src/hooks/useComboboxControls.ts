import React from 'react';

import { useCombobox } from 'downshift';

import { useComboboxSelectors } from '../combobox.store';

export type ComboboxControls = ReturnType<typeof useComboboxControls>;

export const useComboboxControls = () => {
  const isOpen = useComboboxSelectors.isOpen();
  const highlightedIndex = useComboboxSelectors.highlightedIndex();
  const filteredItems = useComboboxSelectors.filteredItems();

  const {
    closeMenu,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getMenuProps,
  } = useCombobox({
    circularNavigation: true,
    highlightedIndex,
    isOpen,
    items: filteredItems,
  });
  getMenuProps({}, { suppressRefError: true });
  getComboboxProps({}, { suppressRefError: true });
  getInputProps({}, { suppressRefError: true });

  return React.useMemo(
    () => ({
      closeMenu,
      getItemProps,
      getMenuProps,
    }),
    [closeMenu, getItemProps, getMenuProps]
  );
};
