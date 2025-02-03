import type { TElement } from '@udecode/plate';

import { useTableStore } from '../../stores';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = useTableStore().useSelectedCellsValue();

  return !!selectedCells?.includes(element);
};
