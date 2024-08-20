import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { StrikethroughPlugin as BaseStrikethroughPlugin } from '../lib/StrikethroughPlugin';

export const StrikethroughPlugin = toPlatePlugin(BaseStrikethroughPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+shift+x',
  },
});
