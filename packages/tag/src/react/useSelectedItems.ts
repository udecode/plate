import type { BaseEditor } from '@platejs/core';
import { useEditorSelector } from '@platejs/core/react';
import type { TTagElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const getSelectedItems = (editor: BaseEditor) =>
  Array.from(
    editor.read.nodes.entries<TTagElement>({
      at: [],
      match: { type: KEYS.tag },
    })
  ).map(([{ children, type, ...option }]) => option);

export const useSelectedItems = () => {
  const selectedItems = useEditorSelector(
    (editor) => getSelectedItems(editor),
    [],
    {
      equalityFn: (prev, next) => {
        if (!prev || prev.length !== next.length) return false;

        return prev.every((item, index) => item.value === next[index].value);
      },
    }
  );

  return selectedItems;
};
