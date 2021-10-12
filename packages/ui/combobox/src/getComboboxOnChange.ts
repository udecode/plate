import { isCollapsed } from '@udecode/plate-common';
import { OnChange } from '@udecode/plate-core';
import { Range } from 'slate';
import { getTextFromTrigger } from './utils/getTextFromTrigger';
import { comboboxStore } from './combobox.store';

/**
 * For each combobox state (byId):
 * - if the selection is collapsed
 * - if the cursor follows the trigger
 * - if there is text without whitespaces after the trigger
 * - open the combobox: set id, search, targetRange in the store
 * Close the combobox if needed
 */
export const getComboboxOnChange = (): OnChange => (editor) => () => {
  const byId = comboboxStore.get.byId();

  let shouldClose = true;

  Object.keys(byId).some((key) => {
    const store = byId[key];

    const id = store.get.id();
    const trigger = store.get.trigger();
    const searchPattern = store.get?.searchPattern?.();

    const { selection } = editor;

    if (selection && isCollapsed(selection)) {
      const cursor = Range.start(selection);

      const isCursorAfterTrigger = getTextFromTrigger(editor, {
        at: cursor,
        trigger,
        searchPattern,
      });

      if (isCursorAfterTrigger) {
        const { range, textAfterTrigger } = isCursorAfterTrigger;

        comboboxStore.set.open({
          activeId: id,
          text: textAfterTrigger,
          targetRange: range,
        });

        shouldClose = false;
        return true;
      }
    }

    return false;
  });

  if (shouldClose && comboboxStore.get.isOpen()) {
    comboboxStore.set.reset();
  }
};
