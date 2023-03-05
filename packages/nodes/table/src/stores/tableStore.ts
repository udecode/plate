import { createAtomStore, TElement } from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';

export const { tableStore, useTableStore } = createAtomStore(
  {
    hoveredColIndex: null as number | null,
    resizingCol: null as { index: number; width: number } | null,
    selectedCells: null as TElement[] | null,
  },
  { name: 'table' as const, scope: ELEMENT_TABLE }
);
