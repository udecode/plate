import {
  type PlateEditor,
  type Value,
  isCollapsed,
} from '@udecode/plate-common/server';
import { Range } from 'slate';

import { comboboxActions, comboboxSelectors } from './combobox.store';
import { getTextFromTrigger } from './utils/getTextFromTrigger';

/**
 * For each combobox state (byId):
 *
 * - If the selection is collapsed
 * - If the cursor follows the trigger
 * - If there is text without whitespaces after the trigger
 * - Open the combobox: set id, search, targetRange in the store Close the
 *   combobox if needed
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
        searchPattern,
        trigger,
      });

      if (!isCursorAfterTrigger) {
        continue;
      }

      const { range, textAfterTrigger } = isCursorAfterTrigger;

      comboboxActions.open({
        activeId: id,
        targetRange: range,
        text: textAfterTrigger,
      });

      shouldClose = false;

      break;
    }

    if (shouldClose && comboboxSelectors.isOpen()) {
      comboboxActions.reset();
    }
  };
