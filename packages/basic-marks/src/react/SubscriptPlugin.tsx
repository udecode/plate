import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { SubscriptPlugin as BaseSubscriptPlugin } from '../lib/SubscriptPlugin';

export const SubscriptPlugin = toPlatePlugin(BaseSubscriptPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+,',
  },
});
