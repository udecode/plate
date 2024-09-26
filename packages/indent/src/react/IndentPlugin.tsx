import { toPlatePlugin } from '@udecode/plate-common/react';

import { BaseIndentPlugin } from '../lib/BaseIndentPlugin';
import { onKeyDownIndent } from './onKeyDownIndent';

export const IndentPlugin = toPlatePlugin(BaseIndentPlugin, {
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
});
