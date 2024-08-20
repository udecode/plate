import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { SuperscriptPlugin as BaseSuperscriptPlugin } from '../lib/SuperscriptPlugin';

export const SuperscriptPlugin = toPlatePlugin(BaseSuperscriptPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+.',
  },
});
