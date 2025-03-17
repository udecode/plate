import { toPlatePlugin } from '@udecode/plate/react';

import { BaseSoftBreakPlugin } from '../../lib/soft-break/BaseSoftBreakPlugin';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const SoftBreakPlugin = toPlatePlugin(BaseSoftBreakPlugin, {
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
});
