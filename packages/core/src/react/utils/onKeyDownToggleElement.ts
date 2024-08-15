import { isHotkey } from 'is-hotkey';
import castArray from 'lodash/castArray.js';

import {
  type HotkeyPluginOptions,
  type KeyboardHandler,
  ParagraphPlugin,
  type PluginConfig,
  toggleNodeType,
} from '../../lib';

export const onKeyDownToggleElement: KeyboardHandler<
  PluginConfig<HotkeyPluginOptions>
> = ({
  editor,
  event,
  plugin: {
    options: { hotkey },
    type,
  },
}) => {
  if (event.defaultPrevented) return;

  const defaultType = editor.getType(ParagraphPlugin);

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
