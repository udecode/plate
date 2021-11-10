import { getAbove } from '@udecode/plate-common';
import { getPlatePluginOptions, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { moveListItems, toggleList } from './transforms';

export const getListOnKeyDown = (pluginKey: string): KeyboardHandler => (
  editor
) => (e) => {
  const { type, hotkey } = getPlatePluginOptions(editor, pluginKey);

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

  for (const key of hotkeys) {
    if (isHotkey(key)(e as any)) {
      toggleList(editor, { type });
    }
  }
};
