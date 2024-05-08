import React from 'react';

import type { TElement } from '@udecode/plate-common';

import { atom, createAtomStore } from '@udecode/plate-common';

export type TableStoreSizeOverrides = Map<number, number>;

export const { TableProvider, tableStore, useTableStore } = createAtomStore(
  {
    colSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    hoveredColIndex: null as null | number,
    marginLeftOverride: null as null | number,
    rowSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
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
    (index: number, size: null | number) => {
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
