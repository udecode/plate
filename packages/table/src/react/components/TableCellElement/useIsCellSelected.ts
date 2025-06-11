import type { TElement } from 'platejs';

import { usePluginOption } from 'platejs/react';

import { TablePlugin } from '../../TablePlugin';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  return !!selectedCells?.includes(element);
};
