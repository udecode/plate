import { toPlatePlugin } from '@platejs/core/react';
import { Key } from '@udecode/react-hotkeys';

import { BaseItalicPlugin } from '../lib/BaseItalicPlugin';

export const ItalicPlugin = toPlatePlugin(BaseItalicPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'i']] } },
});
