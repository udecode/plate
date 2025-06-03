import { type SlateEditor, type TTagElement, KEYS } from '@udecode/plate';
import { useEditorSelector } from '@udecode/plate/react';

export const getSelectedItems = (editor: SlateEditor) => {
  const options = editor.api.nodes<TTagElement>({
    at: [],
    match: { type: KEYS.tag },
  });

  return [...options].map(([{ children, type, ...option }]) => ({
    ...option,
  }));
};

export const useSelectedItems = () => {
  const selectedItems = useEditorSelector(
    (editor) => getSelectedItems(editor),
    [],
    {
      equalityFn: (prev, next) => {
        if (prev.length !== next.length) return false;

        return prev.every((item, index) => item.value === next[index].value);
      },
    }
  );

  return selectedItems;
};
