import type { TElement } from '@udecode/plate';

import { useEditorPlugin } from '@udecode/plate/react';

import { TablePlugin } from '../../TablePlugin';

export const useIsCellSelected = (element: TElement) => {
  const { useOption } = useEditorPlugin(TablePlugin);
  const selectedCells = useOption('selectedCells');

  return !!selectedCells?.includes(element);
};
