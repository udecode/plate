import { getAbove } from '@udecode/plate-common';
import {
  getPlatePluginTypes,
  KeyboardHandler,
  mapPlatePluginKeysToOptions,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { ELEMENT_OL, ELEMENT_UL } from './defaults';
import { moveListItems, toggleList } from './transforms';

export const getListOnKeyDown = (
  pluginKeys?: string | string[]
): KeyboardHandler => (editor) => (e) => {
  const listTypes = getPlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);

  if (e.key === 'Tab' && editor.selection) {
    const listSelected = getAbove(editor, {
      at: editor.selection,
      match: { type: listTypes },
    });

    if (listSelected) {
      e.preventDefault();
      moveListItems(editor, !e.shiftKey);
      return;
    }
  }

  const options = pluginKeys
    ? mapPlatePluginKeysToOptions(editor, pluginKeys)
    : [];

  options.forEach(({ type, hotkey }) => {
    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const key of hotkeys) {
      if (isHotkey(key)(e as any) && listTypes.includes(type)) {
        toggleList(editor, { type });
      }
    }
  });
};
