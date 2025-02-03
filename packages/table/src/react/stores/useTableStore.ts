import React from 'react';

import type { TElement } from '@udecode/plate';

import { atom, createAtomStore } from '@udecode/plate/react';

import type { TableStoreSizeOverrides } from '../../lib';

export const { TableProvider, tableStore, useTableStore } = createAtomStore(
  {
    colSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    marginLeftOverride: null as number | null,
    rowSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    selectedCells: null as TElement[] | null,
    selectedTables: null as TElement[] | null,
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
  const setColSizeOverrides = useTableStore().useSetColSizeOverrides();

  return useOverrideSizeFactory(setColSizeOverrides);
};

export const useOverrideRowSize = () => {
  const setRowSizeOverrides = useTableStore().useSetRowSizeOverrides();

  return useOverrideSizeFactory(setRowSizeOverrides);
};

export const useOverrideMarginLeft = () =>
  useTableStore().useSetMarginLeftOverride();
