import { getAbove, HotkeyPlugin } from '@udecode/plate-common';
import { KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { moveListItems, toggleList } from './transforms';

export const onKeyDownList: KeyboardHandler<{}, HotkeyPlugin> = (
  editor,
  { type, options: { hotkey } }
) => (e) => {
  if (e.key === 'Tab' && editor.selection) {
    const listSelected = getAbove(editor, {
      at: editor.selection,
      match: { type },
    });

    if (listSelected) {
      e.preventDefault();
      moveListItems(editor, { increase: !e.shiftKey });
      return;
    }
  }

  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  for (const _hotkey of hotkeys) {
    if (isHotkey(_hotkey)(e as any)) {
      toggleList(editor, { type: type! });
    }
  }
};
