import { isCollapsed } from '@udecode/plate-common';
import { OnChange } from '@udecode/plate-core';
import { Range } from 'slate';
import { getTextFromTrigger } from './utils/getTextFromTrigger';
import { comboboxStore } from './combobox.store';

export const getComboboxOnChange = (): OnChange => (editor) => () => {
  const byId = comboboxStore.get.byId();

  let shouldClose = true;

  Object.keys(byId).some((key) => {
    const store = byId[key];

    const id = store.get.id();
    const trigger = store.get.trigger();

    const { selection } = editor;

    if (selection && isCollapsed(selection)) {
      const cursor = Range.start(selection);

      const isCursorAfterTrigger = getTextFromTrigger(editor, {
        at: cursor,
        trigger,
      });

      if (isCursorAfterTrigger) {
        const { range, textAfterTrigger } = isCursorAfterTrigger;

        comboboxStore.set.open({
          activeId: id,
          search: textAfterTrigger,
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
