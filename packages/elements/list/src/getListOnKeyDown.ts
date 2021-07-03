import {
  getSlatePluginTypes,
  KeyboardHandler,
  mapSlatePluginKeysToOptions,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { moveListItems } from './transforms/moveListItems';
import { toggleList } from './transforms/toggleList';
import { ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListOnKeyDown = (
  pluginKeys?: string | string[]
): KeyboardHandler => (editor) => (e) => {
  const listTypes = getSlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);

  if (e.key === 'Tab') {
    e.preventDefault();

    moveListItems(editor, !e.shiftKey);
    return;
  }

  const options = pluginKeys
    ? mapSlatePluginKeysToOptions(editor, pluginKeys)
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
