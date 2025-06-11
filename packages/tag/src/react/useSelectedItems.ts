import { type SlateEditor, type TTagElement, KEYS } from 'platejs';
import { useEditorSelector } from 'platejs/react';

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
