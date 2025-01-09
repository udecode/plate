import type { OverrideEditor } from '@udecode/plate/react';

import type { ListConfig } from '../lib/BaseListPlugin';

import { withDeleteForwardList } from '../lib/withDeleteForwardList';
import { withDeleteFragmentList } from '../lib/withDeleteFragmentList';
import { withInsertFragmentList } from '../lib/withInsertFragmentList';
import { withNormalizeList } from '../lib/withNormalizeList';
import { withDeleteBackwardList } from './withDeleteBackwardList';
import { withInsertBreakList } from './withInsertBreakList';

export const withList: OverrideEditor<ListConfig> = (ctx) => ({
  transforms: {
    ...withInsertBreakList(ctx).transforms,
    ...withDeleteBackwardList(ctx).transforms,
    ...withDeleteForwardList(ctx as any).transforms,
    ...withDeleteFragmentList(ctx as any).transforms,
    ...withInsertFragmentList(ctx as any).transforms,
    ...withNormalizeList(ctx as any).transforms,
  },
});
