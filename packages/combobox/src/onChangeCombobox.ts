import { PlateEditor, Value, isCollapsed } from '@udecode/plate-common';
import { Range } from 'slate';

import { comboboxActions, comboboxSelectors } from './combobox.store';
import { getTextFromTrigger } from './utils/getTextFromTrigger';

/**
 * For each combobox state (byId):
 * - if the selection is collapsed
 * - if the cursor follows the trigger
 * - if there is text without whitespaces after the trigger
 * - open the combobox: set id, search, targetRange in the store
 * Close the combobox if needed
 */
export const onChangeCombobox =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) =>
  () => {
    const byId = comboboxSelectors.byId();
    const activeId = comboboxSelectors.activeId();

    let shouldClose = true;

    for (const store of Object.values(byId)) {
      const id = store.get.id();
      const controlled = store.get.controlled?.();

      if (controlled) {
        // do not close controlled comboboxes
        if (activeId === id) {
          shouldClose = false;
          break;
        } else {
          // do not open controlled comboboxes
          continue;
        }
      }

      const { selection } = editor;
      if (!selection || !isCollapsed(selection)) {
        continue;
      }

      const trigger = store.get.trigger();
      const searchPattern = store.get.searchPattern?.();

      const isCursorAfterTrigger = getTextFromTrigger(editor, {
        at: Range.start(selection),
        trigger,
        searchPattern,
      });
      if (!isCursorAfterTrigger) {
        continue;
      }

      const { range, textAfterTrigger } = isCursorAfterTrigger;

      comboboxActions.open({
        activeId: id,
        text: textAfterTrigger,
        targetRange: range,
      });

      shouldClose = false;
      break;
    }

    if (shouldClose && comboboxSelectors.isOpen()) {
      comboboxActions.reset();
    }
  };
