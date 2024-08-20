import type { PlateEditor, WithOverride } from '@udecode/plate-common/react';

import { type TableConfig, withNormalizeTable } from '../lib';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable } from './withMarkTable';
import { withSelectionTable } from './withSelectionTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: WithOverride<TableConfig> = ({ editor, ...ctx }) => {
  editor = withNormalizeTable({ editor, ...ctx } as any) as PlateEditor;
  editor = withDeleteTable({ editor, ...ctx });
  editor = withGetFragmentTable({ editor, ...ctx });
  editor = withInsertFragmentTable({ editor, ...ctx });
  editor = withInsertTextTable({ editor, ...ctx });
  editor = withSelectionTable({ editor, ...ctx });
  editor = withSetFragmentDataTable({ editor, ...ctx });
  editor = withMarkTable({ editor, ...ctx });

  return editor;
};
