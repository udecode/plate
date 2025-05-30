import { toPlatePlugin } from '@udecode/plate-core/react';

import { BaseSoftBreakPlugin } from '../../../lib/plugins/soft-break/BaseSoftBreakPlugin';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const SoftBreakPlugin = toPlatePlugin(BaseSoftBreakPlugin, {
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
});
