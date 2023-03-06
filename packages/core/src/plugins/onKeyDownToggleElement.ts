import { Value } from '@udecode/slate';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { toggleNodeType } from '../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../types/plate/node.types';
import { PlateEditor } from '../types/plate/PlateEditor';
import { HotkeyPlugin } from '../types/plugin/HotkeyPlugin';
import { KeyboardHandlerReturnType } from '../types/plugin/KeyboardHandler';
import { WithPlatePlugin } from '../types/plugin/PlatePlugin';
import { getPluginType } from '../utils/plate/getPluginType';

export const onKeyDownToggleElement = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type, options: { hotkey } }: WithPlatePlugin<HotkeyPlugin, V, E>
): KeyboardHandlerReturnType => (e) => {
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
