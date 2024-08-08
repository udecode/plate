import {
  type KeyboardHandler,
  type ToggleMarkPluginOptions,
  isHotkey,
} from '@udecode/plate-core/server';
import { toggleMark } from '@udecode/slate-utils';

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
