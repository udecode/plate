import { toggleMark } from '@udecode/slate-utils';
import { isHotkey } from 'is-hotkey';

import type { KeyboardHandler, ToggleMarkConfig } from '../../lib';

export const onKeyDownToggleMark: KeyboardHandler<ToggleMarkConfig> = ({
  editor,
  event,
  options: { clear, hotkey },
  type,
}) => {
  if (event.defaultPrevented) return;
  if (!hotkey) return;
  if (isHotkey(hotkey, event as any)) {
    event.preventDefault();

    toggleMark(editor, { clear, key: type as any });
  }
};
