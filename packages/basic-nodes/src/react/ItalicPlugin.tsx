import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseItalicPlugin } from '../lib/BaseItalicPlugin';

export const ItalicPlugin = toPlatePlugin(BaseItalicPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'i']] } },
});
