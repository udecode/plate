import { toPlatePlugin } from '@udecode/plate-common/react';

import { ExitBreakPlugin as BaseExitBreakPlugin } from '../../lib/exit-break/ExitBreakPlugin';
import { onKeyDownExitBreak } from './onKeyDownExitBreak';

export const ExitBreakPlugin = toPlatePlugin(BaseExitBreakPlugin, {
  handlers: {
    onKeyDown: onKeyDownExitBreak,
  },
});
