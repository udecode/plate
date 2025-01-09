import type { OverrideEditor } from '@udecode/plate';

import type { TableConfig } from './BaseTablePlugin';

import { withApplyTable } from './withApplyTable';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: OverrideEditor<TableConfig> = (ctx) => {
  const mark = withMarkTable(ctx);

  return {
    api: {
      // getFragment
      ...withGetFragmentTable(ctx).api,
      ...mark.api,
    },
    transforms: {
      // normalize
      ...withNormalizeTable(ctx).transforms,
      // delete
      ...withDeleteTable(ctx).transforms,
      // insertFragment
      ...withInsertFragmentTable(ctx).transforms,
      // insertText
      ...withInsertTextTable(ctx).transforms,
      // apply
      ...withApplyTable(ctx).transforms,
      // setFragmentData
      ...withSetFragmentDataTable(ctx).transforms,
      // addMark, removeMark
      ...mark.transforms,
    },
  };
};
