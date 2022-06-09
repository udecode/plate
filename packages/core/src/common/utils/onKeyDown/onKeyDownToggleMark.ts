import isHotkey from 'is-hotkey';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { KeyboardHandlerReturnType } from '../../../types/plugins/KeyboardHandler';
import { WithPlatePlugin } from '../../../types/plugins/PlatePlugin';
import { toggleMark } from '../../transforms/toggleMark';
import { ToggleMarkPlugin } from '../../types/plugins/ToggleMarkPlugin';

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
