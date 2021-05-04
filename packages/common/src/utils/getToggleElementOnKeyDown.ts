import {
  getSlatePluginType,
  KeyboardHandler,
  mapSlatePluginKeysToOptions,
  SPEditor,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../types/node.types';

export const getToggleElementOnKeyDown = <T extends SPEditor = SPEditor>(
  pluginKeys: string | string[]
): KeyboardHandler<T> => (editor) => (e) => {
  const defaultType = getSlatePluginType(editor, ELEMENT_DEFAULT);

  const options = mapSlatePluginKeysToOptions(editor, pluginKeys);

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
