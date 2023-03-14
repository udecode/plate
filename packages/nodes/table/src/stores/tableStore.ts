import { createAtomStore, TElement } from '@udecode/plate-common';
import { ELEMENT_TABLE } from '../createTablePlugin';

export type TableStoreSizeOverrides = Map<number, number>;

export const { tableStore, useTableStore } = createAtomStore(
  {
    colSizeOverrides: new Map() as TableStoreSizeOverrides,
    rowSizeOverrides: new Map() as TableStoreSizeOverrides,
    hoveredColIndex: null as number | null,
    selectedCells: null as TElement[] | null,
  },
  { name: 'table' as const, scope: ELEMENT_TABLE }
);

const useOverrideSizeFactory = (
  setOverrides: (
    fn: (overrides: TableStoreSizeOverrides) => TableStoreSizeOverrides
  ) => void
) => (index: number, size: number | null) => {
  setOverrides((overrides) => {
    const newOverrides = new Map(overrides);

    if (size === null) {
      newOverrides.delete(index);
    } else {
      newOverrides.set(index, size);
    }

    return newOverrides;
  });
};

// jotai supports setting with functions, but createAtomStore doesn't know that
export const useOverrideColSize = () => {
  const setColSizeOverrides = useTableStore().set.colSizeOverrides();
  return useOverrideSizeFactory((setColSizeOverrides as unknown) as any);
};

export const useOverrideRowSize = () => {
  const setRowSizeOverrides = useTableStore().set.rowSizeOverrides();
  return useOverrideSizeFactory((setRowSizeOverrides as unknown) as any);
};
