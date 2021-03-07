import { useMemo } from 'react';
import { useCombobox } from 'downshift';
import { useComboboxIsOpen } from '../selectors/useComboboxIsOpen';
import { useComboboxStore } from '../useComboboxStore';

export const useComboboxControls = () => {
  const isOpen = useComboboxIsOpen();
  const itemIndex = useComboboxStore((state) => state.itemIndex);
  const items = useComboboxStore((state) => state.items);

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
    items,
    circularNavigation: true,
    // onInputValueChange: ({inputValue}) => {
    //   setInputItems(
    //     items.filter(item =>
    //       item.toLowerCase().startsWith(inputValue.toLowerCase()),
    //     ),
    //   )
    // },
    // onSelectedItemChange: (changes) => {
    //   console.info(changes);
    // },
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
