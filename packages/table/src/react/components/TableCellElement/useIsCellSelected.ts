import type { TElement } from '@udecode/plate';

import { useMemoizedSelector } from '@udecode/plate/react';

import { useTableStore } from '../../stores';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().get.selectedCells();

  return useMemoizedSelector(
    () => !!selectedCells?.includes(element),
    [element, selectedCells]
  );
};
