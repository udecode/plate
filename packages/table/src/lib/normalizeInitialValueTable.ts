import type { TTableElement, TransformInitialValue } from 'platejs';

import type { TableConfig } from './BaseTablePlugin';

import { computeCellIndices } from './utils';

export const normalizeInitialValueTable: TransformInitialValue<TableConfig> = ({
  editor,
  type,
  value,
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

  return value;
};
