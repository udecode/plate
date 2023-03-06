import { Value } from '@udecode/slate';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../transforms/toggleMark';
import { PlateEditor } from '../types/plate/PlateEditor';
import { KeyboardHandlerReturnType } from '../types/plugin/KeyboardHandler';
import { WithPlatePlugin } from '../types/plugin/PlatePlugin';
import { ToggleMarkPlugin } from '../types/plugin/ToggleMarkPlugin';

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
