import {
  isHotkey,
  KeyboardHandlerReturnType,
  PlateEditor,
  ToggleMarkPlugin,
  WithPlatePlugin,
} from '@udecode/plate-core/server';
import { Value } from '@udecode/slate';
import { toggleMark } from '@udecode/slate-utils';

export const onKeyDownToggleMark =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    {
      type,
      options: { hotkey, clear },
    }: WithPlatePlugin<ToggleMarkPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;
    if (!hotkey) return;

    if (isHotkey(hotkey, e as any)) {
      e.preventDefault();

      toggleMark(editor, { key: type as any, clear });
    }
  };
