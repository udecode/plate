import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleMark } from '../transforms/toggleMark';

export interface GetOnHotkeyToggleMarkOptions {
  /**
   * Key of the mark
   */
  type: string;

  /**
   * Hotkey to toggle the mark
   */
  hotkey?: string;

  /**
   * Mark to clear
   */
  clear?: string | string[];
}

/**
 * Get `onKeyDown` handler to toggle mark if hotkey is pressed.
 */
export const getOnHotkeyToggleMark = ({
  type,
  hotkey,
  clear,
}: GetOnHotkeyToggleMarkOptions) => {
  if (!hotkey) return;

  return (e: any, editor: Editor) => {
    if (hotkey && isHotkey(hotkey, e)) {
      e.preventDefault();

      toggleMark(editor, type, clear);
    }
  };
};
