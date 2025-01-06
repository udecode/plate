import type { NormalizeInitialValue } from '@udecode/plate';

import type { TableConfig } from './BaseTablePlugin';
import type { TTableElement } from './types';

import { computeCellIndices } from './utils';

export const normalizeInitialValueTable: NormalizeInitialValue<TableConfig> = ({
  editor,
  type,
}) => {
  const tables = editor.api.nodes<TTableElement>({
    at: [],
    match: { type },
  });

  for (const [table] of tables) {
    computeCellIndices(editor, {
      tableNode: table,
    });
  }
};
