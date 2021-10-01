import { useMemo } from 'react';
import { useCombobox } from 'downshift';
import { comboboxStore } from '../combobox.store';

export const useComboboxControls = () => {
  const isOpen = comboboxStore.use.isOpen();
  const itemIndex = comboboxStore.use.itemIndex();
  const filteredItems = comboboxStore.use.filteredItems();

  // Menu combobox
  const {
    closeMenu,
    getMenuProps,
    getComboboxProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    isOpen,
    highlightedIndex: itemIndex,
    items: filteredItems,
    circularNavigation: true,
  });
  getMenuProps({}, { suppressRefError: true });
  getComboboxProps({}, { suppressRefError: true });
  getInputProps({}, { suppressRefError: true });

  return useMemo(
    () => ({
      closeMenu,
      getMenuProps,
      getItemProps,
    }),
    [closeMenu, getItemProps, getMenuProps]
  );
};
