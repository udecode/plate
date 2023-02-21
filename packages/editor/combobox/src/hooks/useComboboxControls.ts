import { useMemo } from 'react';
import { useCombobox } from 'downshift';
import { useComboboxSelectors } from '../combobox.store';

export type ComboboxControls = ReturnType<typeof useComboboxControls>;
export const useComboboxControls = () => {
  const isOpen = useComboboxSelectors.isOpen();
  const highlightedIndex = useComboboxSelectors.highlightedIndex();
  const filteredItems = useComboboxSelectors.filteredItems();

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
