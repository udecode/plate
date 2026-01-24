import type { TElement } from 'platejs';

import { usePluginOption } from 'platejs/react';

import { TablePlugin } from '../../TablePlugin';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  // Compare by ID for O(n) instead of reference equality
  // This allows removing the sync effect in useTableCellElement
  return !!selectedCells?.some((cell) => cell.id === element.id);
};
