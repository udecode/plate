import type { WithOverride } from '@udecode/plate-common/server';

import type { TablePluginOptions } from './types';

import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSelectionTable } from './withSelectionTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: WithOverride<TablePluginOptions> = (editor, plugin) => {
  editor = withNormalizeTable(editor, plugin);
  editor = withDeleteTable(editor, plugin);
  editor = withGetFragmentTable(editor, plugin);
  editor = withInsertFragmentTable(editor, plugin);
  editor = withInsertTextTable(editor, plugin);
  editor = withSelectionTable(editor, plugin);
  editor = withSetFragmentDataTable(editor, plugin);
  editor = withMarkTable(editor, plugin);

  return editor;
};
