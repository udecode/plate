import isHotkey from 'is-hotkey';
import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { toggleNodeType } from '../transforms/toggleNodeType';

export interface OnKeyDownElementOptions {
  /**
   * Key of the mark
   */
  type: string;

  /**
   * Hotkey to toggle node type
   */
  hotkey?: string | string[];

  defaultType?: string;
}

/**
 * Get `onKeyDown` handler to toggle node type if hotkey is pressed.
 */
export const getOnKeyDownElement = (
  option: OnKeyDownElementOptions | OnKeyDownElementOptions[]
) => {
  const options = castArray(option);

  return (e: any, editor: Editor) => {
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
};
