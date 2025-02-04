import React from 'react';

import { atom, createAtomStore, useStoreSet } from '@udecode/plate/react';

import type { TableStoreSizeOverrides } from '../../lib';

export const { TableProvider, tableStore, useTableStore } = createAtomStore(
  {
    colSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
    marginLeftOverride: null as number | null,
    rowSizeOverrides: atom(new Map() as TableStoreSizeOverrides),
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
  const setColSizeOverrides = useStoreSet(useTableStore(), 'colSizeOverrides');

  return useOverrideSizeFactory(setColSizeOverrides);
};

export const useOverrideRowSize = () => {
  const setRowSizeOverrides = useStoreSet(useTableStore(), 'rowSizeOverrides');

  return useOverrideSizeFactory(setRowSizeOverrides);
};

export const useOverrideMarginLeft = () =>
  useStoreSet(useTableStore(), 'marginLeftOverride');
