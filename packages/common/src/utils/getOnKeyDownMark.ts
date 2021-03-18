import { OnKeyDown } from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../transforms/toggleMark';

export interface OnKeyDownMarkOptions {
  /**
   * Key of the mark
   */
  type: string;

  /**
   * Hotkey to toggle node type
   */
  hotkey?: string | string[];

  /**
   * Mark to clear
   */
  clear?: string | string[];
}

/**
 * Get `onKeyDown` handler to toggle mark if hotkey is pressed.
 */
export const getOnKeyDownMark = ({
  type,
  hotkey,
  clear,
}: OnKeyDownMarkOptions): OnKeyDown => (editor) => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e)) {
    e.preventDefault();

    toggleMark(editor, type, clear);
  }
};
