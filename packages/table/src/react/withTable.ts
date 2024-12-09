import type { ExtendEditor, PlateEditor } from '@udecode/plate-common/react';

import { type TableConfig, withNormalizeTable } from '../lib';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withSelectionTable } from './withSelectionTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: ExtendEditor<TableConfig> = ({ editor, ...ctx }) => {
  editor = withNormalizeTable({ editor, ...ctx } as any) as PlateEditor;
  editor = withDeleteTable({ editor, ...ctx });
  editor = withGetFragmentTable({ editor, ...ctx });
  editor = withInsertFragmentTable({ editor, ...ctx });
  editor = withInsertTextTable({ editor, ...ctx });
  editor = withSelectionTable({ editor, ...ctx });
  editor = withSetFragmentDataTable({ editor, ...ctx });
  
  return editor;
};
