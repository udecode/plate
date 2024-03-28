import React from 'react';
import { atom, createAtomStore, TElement } from '@udecode/plate-common';

export type TableStoreSizeOverrides = Map<number, number>;

export const { tableStore, useTableStore, TableProvider } = createAtomStore(
  {
    colSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    rowSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    marginLeftOverride: null as number | null,
    hoveredColIndex: null as number | null,
    selectedCells: null as TElement[] | null,
    selectedTable: null as TElement[] | null,
  },
  { name: 'table' as const }
);

const useOverrideSizeFactory = (
  setOverrides: (
    fn: (overrides: TableStoreSizeOverrides) => TableStoreSizeOverrides
  ) => void
) =>
  React.useCallback(
    (index: number, size: number | null) => {
      setOverrides((overrides) => {
        const newOverrides = new Map(overrides);

        if (size === null) {
          newOverrides.delete(index);
        } else {
          newOverrides.set(index, size);
        }

        return newOverrides;
      });
    },
    [setOverrides]
  );

export const useOverrideColSize = () => {
  const setColSizeOverrides = useTableStore().set.colSizeOverrides();
  return useOverrideSizeFactory(setColSizeOverrides);
};

export const useOverrideRowSize = () => {
  const setRowSizeOverrides = useTableStore().set.rowSizeOverrides();
  return useOverrideSizeFactory(setRowSizeOverrides);
};

export const useOverrideMarginLeft = () =>
  useTableStore().set.marginLeftOverride();
