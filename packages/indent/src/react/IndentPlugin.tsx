import { toPlatePlugin } from '@udecode/plate/react';

import { BaseIndentPlugin } from '../lib/BaseIndentPlugin';
import { onKeyDownIndent } from './onKeyDownIndent';

export const IndentPlugin = toPlatePlugin(BaseIndentPlugin, {
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
});
