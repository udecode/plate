import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { BoldPlugin as BaseBoldPlugin } from '../lib/BoldPlugin';

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+b',
  },
});
