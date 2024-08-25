import type { ExtendEditor } from '@udecode/plate-common';

import type { TableConfig } from './types';

import { withNormalizeTable } from './withNormalizeTable';

export const withTable: ExtendEditor<TableConfig> = ({ editor, ...ctx }) => {
  editor = withNormalizeTable({ editor, ...ctx });
  // TODO react
  // editor = withDeleteTable({ editor, ...ctx });
  // editor = withGetFragmentTable({ editor, ...ctx });
  // editor = withInsertFragmentTable({ editor, ...ctx });
  // editor = withInsertTextTable({ editor, ...ctx });
  // editor = withSelectionTable({ editor, ...ctx });
  // editor = withSetFragmentDataTable({ editor, ...ctx });
  // editor = withMarkTable({ editor, ...ctx });

  return editor;
};
