import { getAbove } from '@udecode/plate-common';
import { getPlugin, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { moveListItems, toggleList } from './transforms';

export const getListOnKeyDown = (key: string): KeyboardHandler => (editor) => (
  e
) => {
  const { type, hotkey } = getPlugin(editor, key);

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
      toggleList(editor, { type });
    }
  }
};
