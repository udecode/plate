import type { ExtendEditorApi, ExtendEditorTransforms } from '@udecode/plate';

import type { TableConfig } from './BaseTablePlugin';

import { withApplyTable } from './withApplyTable';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable, withMarkTableApi } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTableTransforms: ExtendEditorTransforms<TableConfig> = (
  ctx
) => ({
  // normalize
  ...withNormalizeTable(ctx),
  // delete
  ...withDeleteTable(ctx),
  // insertFragment
  ...withInsertFragmentTable(ctx),
  // insertText
  ...withInsertTextTable(ctx),
  // apply
  ...withApplyTable(ctx),
  // setFragmentData
  ...withSetFragmentDataTable(ctx),
  // addMark, removeMark
  ...withMarkTable(ctx),
});

export const withTableApi: ExtendEditorApi<TableConfig> = (ctx) => ({
  // getFragment
  ...withGetFragmentTable(ctx),
  // marks
  ...withMarkTableApi(ctx),
});
