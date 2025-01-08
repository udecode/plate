import type { ExtendEditorTransforms } from '@udecode/plate/react';

import type { ListConfig } from '../lib/BaseListPlugin';

import { withDeleteForwardList } from '../lib/withDeleteForwardList';
import { withDeleteFragmentList } from '../lib/withDeleteFragmentList';
import { withInsertFragmentList } from '../lib/withInsertFragmentList';
import { withNormalizeList } from '../lib/withNormalizeList';
import { withDeleteBackwardList } from './withDeleteBackwardList';
import { withInsertBreakList } from './withInsertBreakList';

export const withList: ExtendEditorTransforms<ListConfig> = (ctx) => ({
  ...withInsertBreakList(ctx),
  ...withDeleteBackwardList(ctx),
  ...withDeleteForwardList(ctx as any),
  ...withDeleteFragmentList(ctx as any),
  ...withInsertFragmentList(ctx as any),
  ...withNormalizeList(ctx as any),
});
