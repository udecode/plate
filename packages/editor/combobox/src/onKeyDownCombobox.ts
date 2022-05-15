import {
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { getNextWrappingIndex } from './utils/getNextWrappingIndex';
import {
  comboboxActions,
  comboboxSelectors,
  getComboboxStoreById,
} from './combobox.store';

/**
 * If the combobox is open, handle:
 * - down (next item)
 * - up (previous item)
 * - escape (reset combobox)
 * - tab, enter (select item)
 */
export const onKeyDownCombobox = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): KeyboardHandlerReturnType => (event) => {
  const {
    highlightedIndex,
    filteredItems,
    activeId,
  } = comboboxSelectors.state();
  const isOpen = comboboxSelectors.isOpen();

  if (!isOpen) return;

  const store = getComboboxStoreById(activeId);
  if (!store) return;

  const onSelectItem = store.get.onSelectItem();

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    const newIndex = getNextWrappingIndex(
      1,
      highlightedIndex,
      filteredItems.length,
      () => {},
      true
    );
    comboboxActions.highlightedIndex(newIndex);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();

    const newIndex = getNextWrappingIndex(
      -1,
      highlightedIndex,
      filteredItems.length,
      () => {},
      true
    );
    comboboxActions.highlightedIndex(newIndex);
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    comboboxActions.reset();
    return;
  }

  if (['Tab', 'Enter'].includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
    if (filteredItems[highlightedIndex]) {
      onSelectItem?.(editor, filteredItems[highlightedIndex]);
    }
  }
};
