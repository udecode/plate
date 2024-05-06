import { Hotkeys } from '@udecode/plate-common';
import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type Value,
  isHotkey,
} from '@udecode/plate-common/server';

import {
  comboboxActions,
  comboboxSelectors,
  getComboboxStoreById,
} from './combobox.store';
import { getNextWrappingIndex } from './utils/getNextWrappingIndex';

/**
 * If the combobox is open, handle:
 *
 * - Down (next item)
 * - Up (previous item)
 * - Escape (reset combobox)
 * - Tab, enter (select item)
 */
export const onKeyDownCombobox =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (event) => {
    const { activeId, filteredItems, highlightedIndex } =
      comboboxSelectors.state();
    const isOpen = comboboxSelectors.isOpen();

    if (!isOpen) return;

    const store = getComboboxStoreById(activeId);

    if (!store) return;

    const onSelectItem = store.get.onSelectItem();

    if (isHotkey('down', event)) {
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
    if (isHotkey('up', event)) {
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
    if (isHotkey('escape', event)) {
      event.preventDefault();
      comboboxActions.reset();

      return;
    }
    if (Hotkeys.isTab(editor, event) || isHotkey('enter', event)) {
      event.preventDefault();
      event.stopPropagation();

      if (filteredItems[highlightedIndex]) {
        onSelectItem?.(editor, filteredItems[highlightedIndex]);
      }
    }
  };
