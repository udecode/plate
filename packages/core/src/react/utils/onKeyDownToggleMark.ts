import { toggleMark } from '@udecode/slate-utils';
import { isHotkey } from 'is-hotkey';

import type { KeyboardHandler, ToggleMarkPluginOptions } from '../../lib';

export const onKeyDownToggleMark: KeyboardHandler<ToggleMarkPluginOptions> = ({
  editor,
  event,
  plugin: {
    options: { clear, hotkey },
    type,
  },
}) => {
  if (event.defaultPrevented) return;
  if (!hotkey) return;
  if (isHotkey(hotkey, event as any)) {
    event.preventDefault();

    toggleMark(editor, { clear, key: type as any });
  }
};
