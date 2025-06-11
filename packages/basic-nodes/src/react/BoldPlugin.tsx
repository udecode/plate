import { Key, toPlatePlugin } from 'platejs/react';

import { BaseBoldPlugin } from '../lib/BaseBoldPlugin';

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'b']] } },
});
