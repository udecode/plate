import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { UnderlinePlugin as BaseUnderlinePlugin } from '../lib/UnderlinePlugin';

export const UnderlinePlugin = toPlatePlugin(BaseUnderlinePlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+u',
  },
});
