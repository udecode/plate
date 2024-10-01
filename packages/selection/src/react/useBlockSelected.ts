import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export const useBlockSelected = (_id?: string) => {
  const { useOption } = useEditorPlugin(BlockSelectionPlugin);
  const { id } = useElement();

  const isBlockSelected = useOption('isSelected', id as string);

  return isBlockSelected;
};
