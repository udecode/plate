import type { Value } from '@udecode/slate';

import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type ToggleMarkPlugin,
  type WithPlatePlugin,
  isHotkey,
} from '@udecode/plate-core/server';
import { toggleMark } from '@udecode/slate-utils';

export const onKeyDownToggleMark =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    {
      options: { clear, hotkey },
      type,
    }: WithPlatePlugin<ToggleMarkPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;
    if (!hotkey) return;
    if (isHotkey(hotkey, e as any)) {
      e.preventDefault();

      toggleMark(editor, { clear, key: type as any });
    }
  };
