import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { KeyboardHandlerReturnType } from '../../../types/plugins/KeyboardHandler';
import { WithPlatePlugin } from '../../../types/plugins/PlatePlugin';
import { getPluginType } from '../../../utils/getPluginType';
import { toggleNodeType } from '../../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../../types/node.types';
import { HotkeyPlugin } from '../../types/plugins/HotkeyPlugin';

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
