import { toPlatePlugin } from '@platejs/core/react';
import { Key } from '@udecode/react-hotkeys';

import { BaseBoldPlugin } from '../lib/BaseBoldPlugin';

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'b']] } },
});
