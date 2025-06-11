import { Key, toPlatePlugin } from 'platejs/react';

import { BaseUnderlinePlugin } from '../lib/BaseUnderlinePlugin';

export const UnderlinePlugin = toPlatePlugin(BaseUnderlinePlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'u']] } },
});
