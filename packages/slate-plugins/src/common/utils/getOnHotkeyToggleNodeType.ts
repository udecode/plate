import isHotkey from 'is-hotkey';
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

  return (e: any, editor: Editor) => {
    if (isHotkey(hotkey, e)) {
      e.preventDefault();

      toggleNodeType(editor, { activeType: type, inactiveType: defaultType });
    }
  };
};
