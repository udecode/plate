import {
  OnKeyDown,
  OnKeyDownElementOptions,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import castArray from 'lodash/castArray';
import { toggleNodeType } from '../transforms/toggleNodeType';

/**
 * Get `onKeyDown` handler to toggle node type if hotkey is pressed.
 */
export const getOnKeyDownElement = (
  option: OnKeyDownElementOptions | OnKeyDownElementOptions[]
): OnKeyDown => (editor) => (e) => {
  const options = castArray(option);

  options.forEach(({ type, defaultType, hotkey }) => {
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
