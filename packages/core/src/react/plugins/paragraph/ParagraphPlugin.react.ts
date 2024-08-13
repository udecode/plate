import type { HotkeyPluginOptions } from '../../../lib';

import { ParagraphPlugin as BaseParagraphPlugin } from '../../../lib/plugins/paragraph/ParagraphPlugin';
import { onKeyDownToggleElement } from '../../utils/onKeyDownToggleElement';

export const ParagraphPlugin = BaseParagraphPlugin.extend<HotkeyPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  },
});
