import {
  getPlatePluginOptions,
  getPlatePluginType,
  KeyboardHandler,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../types/node.types';

export const getToggleElementOnKeyDown = <T = {}>(
  key: string
): KeyboardHandler<T> => (editor) => (e) => {
  const defaultType = getPlatePluginType<T>(editor, ELEMENT_DEFAULT);

  const { type, hotkey } = getPlatePluginOptions(editor, key);

  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  for (const _hotkey of hotkeys) {
    if (isHotkey(_hotkey, e as any)) {
      e.preventDefault();
      toggleNodeType(editor, {
        activeType: type,
        inactiveType: defaultType,
      });
      return;
    }
  }
};
