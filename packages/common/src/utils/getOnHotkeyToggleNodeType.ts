import isHotkey from 'is-hotkey';
import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { HotkeyOptions } from '../types/PluginOptions.types';

export interface GetOnHotkeyToggleNodeTypeOptions extends HotkeyOptions {
  /**
   * Key of the mark
   */
  type: string;
}

/**
 * Get `onKeyDown` handler to toggle node type if hotkey is pressed.
 */
export const getOnHotkeyToggleNodeType = ({
  type,
  defaultType,
  hotkey,
}: GetOnHotkeyToggleNodeTypeOptions) => {
  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  return (e: any, editor: Editor) => {
    for (const key of hotkeys) {
      if (isHotkey(key, e)) {
        e.preventDefault();
        toggleNodeType(editor, { activeType: type, inactiveType: defaultType });
        return;
      }
    }
  };
};
