import { toTPlatePlugin } from '@udecode/plate-core/react';

import { type ResetNodeConfig, BaseResetNodePlugin } from '../../../lib';
import { onKeyDownResetNode } from './onKeyDownResetNode';

/**
 * Enables support for resetting block type from rules with React-specific
 * features.
 */
export const ResetNodePlugin = toTPlatePlugin<ResetNodeConfig>(
  BaseResetNodePlugin,
  {
    handlers: {
      onKeyDown: onKeyDownResetNode,
    },
  }
);
