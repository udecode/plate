import { useMemo } from 'react';
import { TElement } from '@udecode/plate-core';
import { useAtom } from 'jotai';
import { selectedCellsAtom } from '../table.atoms';

export const useIsCellSelected = (element: TElement) => {
  const [selectedCells] = useAtom(selectedCellsAtom);

  return useMemo(() => selectedCells?.includes(element), [
    element,
    selectedCells,
  ]);
};
