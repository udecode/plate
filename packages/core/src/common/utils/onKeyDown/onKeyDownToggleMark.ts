import isHotkey from 'is-hotkey';
import { KeyboardHandler } from '../../../types/plugins/KeyboardHandler';
import { toggleMark } from '../../transforms/toggleMark';
import { ToggleMarkPlugin } from '../../types/plugins/ToggleMarkPlugin';

export const onKeyDownToggleMark: KeyboardHandler<{}, ToggleMarkPlugin> = (
  editor,
  { type, options: { hotkey, clear } }
) => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();

    toggleMark(editor, { key: type, clear });
  }
};
