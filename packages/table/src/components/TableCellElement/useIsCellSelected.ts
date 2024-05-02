import React from 'react';
import { TElement } from '@udecode/plate-common/server';

import { useTableStore } from '../../stores/tableStore';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().get.selectedCells();

  return React.useMemo(
    () => !!selectedCells?.includes(element),
    [element, selectedCells]
  );
};
