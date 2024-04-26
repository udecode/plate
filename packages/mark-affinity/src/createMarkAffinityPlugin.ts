import { createPluginFactory } from '@udecode/plate-common';

import { MarkAffinityPlugin } from './types';
import { withMarkAffinity } from './withMarkAffinity';

export const KEY_MARK_AFFINITY = 'mark-affinity';

export const createMarkAffinityPlugin = createPluginFactory<MarkAffinityPlugin>(
  {
    key: KEY_MARK_AFFINITY,
    withOverrides: withMarkAffinity,
  }
);
