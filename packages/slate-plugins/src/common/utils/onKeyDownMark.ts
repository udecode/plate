import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleMark } from '../transforms/toggleMark';

export interface MarkOnKeyDownOptions {
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
 * Get `onKeyDown` handler if there is a hotkey defined.
 */
export const onKeyDownMark = ({ type, hotkey, clear }: MarkOnKeyDownOptions) =>
  hotkey
    ? (e: any, editor: Editor) => {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          toggleMark(editor, type, clear);
        }
      }
    : undefined;
