import { KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../../transforms/toggleMark';
import { ToggleMarkPlugin } from '../../types/plugins/ToggleMarkPlugin';

export const getToggleMarkOnKeyDown = (
  key: string
): KeyboardHandler<{}, ToggleMarkPlugin> => (
  editor,
  { hotkey, type = key, clear }
) => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();

    toggleMark(editor, type, clear);
  }
};
