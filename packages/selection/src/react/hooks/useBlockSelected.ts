import { useElement, usePluginStore } from '@platejs/core/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useBlockSelected = (_id?: string) => {
  const { id } = useElement();

  const isBlockSelected = usePluginStore(
    BlockSelectionPlugin,
    'isSelected',
    _id ?? (id as string)
  );

  return isBlockSelected;
};
