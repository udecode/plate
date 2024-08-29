import { toPlatePlugin } from '@udecode/plate-common/react';

import { SoftBreakPlugin as BaseSoftBreakPlugin } from '../../lib/soft-break/SoftBreakPlugin';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const SoftBreakPlugin = toPlatePlugin(BaseSoftBreakPlugin, {
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
});
