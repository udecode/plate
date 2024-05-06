import type { Value } from '@udecode/slate';

import {
  ELEMENT_DEFAULT,
  type HotkeyPlugin,
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type WithPlatePlugin,
  getPluginType,
  isHotkey,
  toggleNodeType,
} from '@udecode/plate-core/server';
import castArray from 'lodash/castArray.js';

export const onKeyDownToggleElement =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options: { hotkey }, type }: WithPlatePlugin<HotkeyPlugin, V, E>
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
