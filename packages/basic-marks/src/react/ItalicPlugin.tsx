import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { ItalicPlugin as BaseItalicPlugin } from '../lib/ItalicPlugin';

export const ItalicPlugin = toPlatePlugin(BaseItalicPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+i',
  },
});
