import { toPlatePlugin } from '@udecode/plate-core/react';

import { BaseExitBreakPlugin } from '../../../lib';
import { onKeyDownExitBreak } from './onKeyDownExitBreak';

export const ExitBreakPlugin = toPlatePlugin(BaseExitBreakPlugin, {
  handlers: {
    onKeyDown: onKeyDownExitBreak,
  },
});
