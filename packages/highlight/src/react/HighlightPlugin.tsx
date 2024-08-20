import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { HighlightPlugin as BaseHighlightPlugin } from '../lib/HighlightPlugin';

export const HighlightPlugin = toPlatePlugin(BaseHighlightPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
});
