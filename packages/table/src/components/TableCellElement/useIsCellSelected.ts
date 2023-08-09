import { useMemo } from 'react';
import { TElement } from '@udecode/plate-common';

import { useTableStore } from '../../stores/tableStore';

export const useIsCellSelected = (element: TElement) => {
  const selectedCellEntries = useTableStore().get.selectedCells();
  const selectedCells = (selectedCellEntries || []).map((entry) => entry[0]);

  return useMemo(
    () => !!selectedCells?.includes(element),
    [element, selectedCells]
  );
};
