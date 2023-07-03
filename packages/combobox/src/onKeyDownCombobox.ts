import {
  Hotkeys,
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import {
  comboboxActions,
  comboboxSelectors,
  getComboboxStoreById,
} from './combobox.store';
import { getNextWrappingIndex } from './utils/getNextWrappingIndex';

/**
 * If the combobox is open, handle:
 * - down (next item)
 * - up (previous item)
 * - escape (reset combobox)
 * - tab, enter (select item)
 */
export const onKeyDownCombobox =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (event) => {
    const { highlightedIndex, filteredItems, activeId } =
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
