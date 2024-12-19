import type { ExtendEditor } from '@udecode/plate-common';

import type { TableConfig } from './types';

import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSelectionTable } from './withSelectionTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: ExtendEditor<TableConfig> = ({ editor, ...ctx }) => {
  editor = withNormalizeTable({ editor, ...ctx });
  editor = withDeleteTable({ editor, ...ctx });
  editor = withGetFragmentTable({ editor, ...ctx });
  editor = withInsertFragmentTable({ editor, ...ctx });
  editor = withInsertTextTable({ editor, ...ctx });
  editor = withSelectionTable({ editor, ...ctx });
  editor = withSetFragmentDataTable({ editor, ...ctx });
  editor = withMarkTable({ editor, ...ctx });

  return editor;
};
