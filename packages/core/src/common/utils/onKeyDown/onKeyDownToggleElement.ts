import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import {KeyboardHandler} from "../../../types/plugins/KeyboardHandler";
import {getPluginType} from "../../../utils/getPluginType";
import { toggleNodeType } from '../../transforms/toggleNodeType';
import { ELEMENT_DEFAULT } from '../../types/node.types';
import { HotkeyPlugin } from '../../types/plugins/HotkeyPlugin';
  
export const onKeyDownToggleElement: KeyboardHandler<{}, HotkeyPlugin> = (
  editor,
  { type, options: { hotkey } }
) => (e) => {
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
