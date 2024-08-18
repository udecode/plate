import React from 'react';

import type { TElement } from '@udecode/plate-common';

import { useTableStore } from '../../stores';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().get.selectedCells();

  return React.useMemo(
    () => !!selectedCells?.includes(element),
    [element, selectedCells]
  );
};
