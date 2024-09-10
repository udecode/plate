import { toPlatePlugin } from '@udecode/plate-common/react';

import { IndentPlugin as BaseIndentPlugin } from '../lib/IndentPlugin';
import { onKeyDownIndent } from './onKeyDownIndent';

export const IndentPlugin = toPlatePlugin(BaseIndentPlugin, {
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
});
