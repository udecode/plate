import type { KeyboardHandler } from 'platejs/react';

import { Hotkeys } from 'platejs';

import {
  type TableConfig,
  getCellTypes,
  KEY_SHIFT_EDGES,
  moveSelectionFromCell,
} from '../lib';

export const onKeyDownTable: KeyboardHandler<TableConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;

  const compositeKeyCode = 229;

  if (
    // This exception only occurs when IME composition is triggered, and can be identified by this keycode
    event.which === compositeKeyCode &&
    editor.selection &&
    editor.api.isExpanded()
  ) {
    // fix the exception of inputting Chinese when selecting multiple cells
    const tdEntries = Array.from(
      editor.api.nodes({
        at: editor.selection,
        match: { type: getCellTypes(editor) },
      })
    );

    if (tdEntries.length > 1) {
      editor.tf.collapse({
        edge: 'end',
      });

      return;
    }
  }

  const isKeyDown: any = {
    'shift+down': Hotkeys.isExtendDownward(event),
    'shift+left': Hotkeys.isExtendBackward(event),
    'shift+right': Hotkeys.isExtendForward(event),
    'shift+up': Hotkeys.isExtendUpward(event),
  };

  Object.keys(isKeyDown).forEach((key) => {
    if (
      isKeyDown[key] && // if many cells are selected
      moveSelectionFromCell(editor, {
        edge: (KEY_SHIFT_EDGES as any)[key],
        reverse: key === 'shift+up',
      })
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
};
