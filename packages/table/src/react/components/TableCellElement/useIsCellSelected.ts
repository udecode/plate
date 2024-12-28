import type { TElement } from '@udecode/plate-common';

import { useMemoizedSelector } from '@udecode/plate-common/react';

import { useTableStore } from '../../stores';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().get.selectedCells();

  return useMemoizedSelector(
    () => !!selectedCells?.includes(element),
    [element, selectedCells]
  );
};
