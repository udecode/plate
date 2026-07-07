import { toPlatePlugin } from '@platejs/core/react';
import { Key } from '@udecode/react-hotkeys';

import { BaseUnderlinePlugin } from '../lib/BaseUnderlinePlugin';

export const UnderlinePlugin = toPlatePlugin(BaseUnderlinePlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'u']] } },
});
