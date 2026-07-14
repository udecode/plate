import type { TTableElement } from '@platejs/utils';
import type { TransformInitialValue } from '@platejs/core';

import type { TableConfig } from './BaseTablePlugin';

import { computeCellIndices } from './utils';

export const normalizeInitialValueTable: TransformInitialValue<TableConfig> = ({
  editor,
  type,
  value,
}) => {
  const tables = editor.read.nodes.entries<TTableElement>({
    at: [],
    match: { type },
  });

  for (const [table] of tables) {
    computeCellIndices(editor, {
      tableNode: table,
    });
  }

  return value;
};
