import { useEditorSelector } from '@platejs/core/react';

import { BaseTagPlugin } from '../lib';

export const useSelectedItems = () => {
  const selectedItems = useEditorSelector(
    (editor) => editor.plugin(BaseTagPlugin).read.getSelectedItems(),
    {
      equalityFn: (prev, next) => {
        if (!prev || prev.length !== next.length) return false;

        return prev.every((item, index) => item.value === next[index].value);
      },
    }
  );

  return selectedItems;
};
