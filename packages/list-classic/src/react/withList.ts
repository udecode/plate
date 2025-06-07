import type { OverrideEditor } from '@udecode/plate/react';

import { KEYS } from '@udecode/plate';

import type { ListConfig } from '../lib/BaseListPlugin';

import { unwrapList } from '../lib';
import { withDeleteForwardList } from '../lib/withDeleteForwardList';
import { withDeleteFragmentList } from '../lib/withDeleteFragmentList';
import { withInsertFragmentList } from '../lib/withInsertFragmentList';
import { withNormalizeList } from '../lib/withNormalizeList';
import { withDeleteBackwardList } from './withDeleteBackwardList';
import { withInsertBreakList } from './withInsertBreakList';

export const withList: OverrideEditor<ListConfig> = (ctx) => {
  const {
    editor,
    tf: { resetBlock },
  } = ctx;

  return {
    transforms: {
      resetBlock: (options) => {
        if (
          editor.api.block({
            at: options?.at,
            match: { type: editor.getType(KEYS.li) },
          })
        ) {
          unwrapList(editor);
          return;
        }

        return resetBlock(options);
      },
      ...withInsertBreakList(ctx).transforms,
      ...withDeleteBackwardList(ctx).transforms,
      ...withDeleteForwardList(ctx as any).transforms,
      ...withDeleteFragmentList(ctx as any).transforms,
      ...withInsertFragmentList(ctx as any).transforms,
      ...withNormalizeList(ctx as any).transforms,
    },
  };
};
