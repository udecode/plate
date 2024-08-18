import type { HotkeyPluginOptions } from '../../../lib';

import { ParagraphPlugin as BaseParagraphPlugin } from '../../../lib';
import { extendPlatePlugin } from '../../plugin/extendPlatePlugin';
import { onKeyDownToggleElement } from '../../utils/onKeyDownToggleElement';

export const ParagraphPlugin = extendPlatePlugin(BaseParagraphPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  } as HotkeyPluginOptions,
});
