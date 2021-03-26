import {
  getSlatePluginType,
  mapSlatePluginKeysToOptions,
  OnKeyDown,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../types/node.types';

export const getToggleElementOnKeyDown = (
  pluginKeys: string | string[]
): OnKeyDown => (editor) => (e) => {
  const defaultType = getSlatePluginType(editor, ELEMENT_DEFAULT);

  const options = mapSlatePluginKeysToOptions(editor, pluginKeys);

  options.forEach(({ type, hotkey }) => {
    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const key of hotkeys) {
      if (isHotkey(key, e)) {
        e.preventDefault();
        toggleNodeType(editor, {
          activeType: type,
          inactiveType: defaultType,
        });
        return;
      }
    }
  });
};
