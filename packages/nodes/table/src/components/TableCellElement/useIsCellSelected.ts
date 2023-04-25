import { useMemo } from 'react';
import { TElement } from '@udecode/plate-common';
import { useTableStore } from '../../stores/tableStore';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().get.selectedCells();

  return useMemo(() => !!selectedCells?.includes(element), [
    element,
    selectedCells,
  ]);
};
