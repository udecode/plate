import { useEditorPlugin, useElement } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useBlockSelected = (_id?: string) => {
  const { useOption } = useEditorPlugin(BlockSelectionPlugin);
  const { id } = useElement();

  const isBlockSelected = useOption('isSelected', _id ?? (id as string));

  return isBlockSelected;
};
