import { toPlatePlugin } from '@udecode/plate-common/react';

import { ResetNodePlugin as BaseResetNodePlugin } from '../lib/ResetNodePlugin';
import { onKeyDownResetNode } from './onKeyDownResetNode';

/**
 * Enables support for resetting block type from rules with React-specific
 * features.
 */
export const ResetNodePlugin = toPlatePlugin(BaseResetNodePlugin, {
  handlers: {
    onKeyDown: onKeyDownResetNode,
  },
});
