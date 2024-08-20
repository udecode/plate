import type { HotkeyPluginOptions } from '../../../lib';

import { ParagraphPlugin as BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';
import { onKeyDownToggleElement } from '../../utils/onKeyDownToggleElement';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  } as HotkeyPluginOptions,
});
