import {
  KeyboardHandlerReturnType,
  PlateEditor,
  ToggleMarkPlugin,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { Value } from '@udecode/slate';
import { toggleMark } from '@udecode/slate-utils';
import isHotkey from 'is-hotkey';

export const onKeyDownToggleMark = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type, options: { hotkey, clear } }: WithPlatePlugin<ToggleMarkPlugin, V, E>
): KeyboardHandlerReturnType => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();

    toggleMark(editor, { key: type as any, clear });
  }
};
