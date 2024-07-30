import type { KeyboardHandler } from '@udecode/plate-common';

import {
  ELEMENT_DEFAULT,
  type HotkeyPluginOptions,
  getPluginType,
  isHotkey,
  toggleNodeType,
} from '@udecode/plate-core/server';
import castArray from 'lodash/castArray.js';

export const onKeyDownToggleElement: KeyboardHandler<HotkeyPluginOptions> =
  (editor, { options: { hotkey }, type }) =>
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
