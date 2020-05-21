import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { toggleMark } from './transforms';
import { MarkOnKeyDownOptions } from './types';

export function onKeyDownMark(
  type: string,
  hotkey: undefined,
  options?: MarkOnKeyDownOptions
): null;
export function onKeyDownMark(
  type: string,
  hotkey?: string,
  options?: MarkOnKeyDownOptions
): (e: any, editor: Editor) => void;
export function onKeyDownMark(
  type: string,
  hotkey?: string,
  { clear }: MarkOnKeyDownOptions = {}
) {
  if (!hotkey) return null;

  return (e: any, editor: Editor) => {
    if (isHotkey(hotkey, e)) {
      e.preventDefault();
      toggleMark(editor, type, clear);
    }
  };
}
