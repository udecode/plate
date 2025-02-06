import type { TElement } from '@udecode/plate';

import { usePluginOption } from '@udecode/plate/react';

import { TablePlugin } from '../../TablePlugin';

export const useIsCellSelected = (element: TElement) => {
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  return !!selectedCells?.includes(element);
};
