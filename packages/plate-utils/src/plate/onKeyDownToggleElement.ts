import {
  ELEMENT_DEFAULT,
  getPluginType,
  HotkeyPlugin,
  isHotkey,
  KeyboardHandlerReturnType,
  PlateEditor,
  toggleNodeType,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { Value } from '@udecode/slate';
import { castArray } from 'lodash-es';

export const onKeyDownToggleElement =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { type, options: { hotkey } }: WithPlatePlugin<HotkeyPlugin, V, E>
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;

    const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const _hotkey of hotkeys) {
      if (isHotkey(_hotkey, e as any)) {
        e.preventDefault();
        toggleNodeType(editor, {
          activeType: type,
          inactiveType: defaultType,
        });
        return;
      }
    }
  };
