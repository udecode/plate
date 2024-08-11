import {
  ELEMENT_DEFAULT,
  type HotkeyPluginOptions,
  type KeyboardHandler,
  getPluginType,
  isHotkey,
  toggleNodeType,
} from '@udecode/plate-core';
import castArray from 'lodash/castArray.js';

export const onKeyDownToggleElement: KeyboardHandler<HotkeyPluginOptions> = ({
  editor,
  event,
  plugin: {
    options: { hotkey },
    type,
  },
}) => {
  if (event.defaultPrevented) return;

  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  for (const _hotkey of hotkeys) {
    if (isHotkey(_hotkey, event as any)) {
      event.preventDefault();
      toggleNodeType(editor, {
        activeType: type,
        inactiveType: defaultType,
      });

      return;
    }
  }
};
