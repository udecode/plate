import { useMemo } from 'react';
import { useCombobox } from 'downshift';
import { comboboxStore } from '../combobox.store';

export const useComboboxControls = () => {
  const isOpen = comboboxStore.use.isOpen();
  const highlightedIndex = comboboxStore.use.highlightedIndex();
  const filteredItems = comboboxStore.use.filteredItems();

  const {
    closeMenu,
    getMenuProps,
    getComboboxProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    isOpen,
    highlightedIndex,
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
