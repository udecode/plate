import {
  getPlatePluginType,
  KeyboardHandler,
  mapPlatePluginKeysToOptions,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../types/node.types';

export const getToggleElementOnKeyDown = <T = {}>(
  pluginKeys: string | string[]
): KeyboardHandler<T> => (editor) => (e) => {
  const defaultType = getPlatePluginType<T>(editor, ELEMENT_DEFAULT);

  const options = mapPlatePluginKeysToOptions(editor, pluginKeys);

  options.forEach(({ type, hotkey }) => {
    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const key of hotkeys) {
      if (isHotkey(key, e as any)) {
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
