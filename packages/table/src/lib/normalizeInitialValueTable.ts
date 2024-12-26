import {
  type NormalizeInitialValue,
  getNodeEntries,
} from '@udecode/plate-common';

import type { TableConfig } from './BaseTablePlugin';
import type { TTableElement } from './types';

import { computeCellIndices } from './utils';

export const normalizeInitialValueTable: NormalizeInitialValue<TableConfig> = ({
  editor,
  type,
}) => {
  const tables = getNodeEntries<TTableElement>(editor, {
    at: [],
    match: { type },
  });

  for (const [table] of tables) {
    computeCellIndices(editor, {
      tableNode: table,
    });
  }
};
