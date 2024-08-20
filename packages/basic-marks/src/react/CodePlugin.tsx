import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { CodePlugin as BaseCodePlugin } from '../lib/CodePlugin';

export const CodePlugin = toPlatePlugin(BaseCodePlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+e',
  },
});
