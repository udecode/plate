import { useCallback } from 'react';
import { MentionNodeData } from '@udecode/plate';
import { TEditor } from '@udecode/plate-core';
import shallow from 'zustand/shallow';
import { IComboboxItem } from '../../combobox/components/Combobox.types';
import { useComboboxOnChange } from '../../combobox/hooks/useComboboxOnChange';
import { ComboboxKey, useComboboxStore } from '../../combobox/useComboboxStore';

export const useTagOnChange = (editor: TEditor, data: MentionNodeData[]) => {
  const comboboxOnChange = useComboboxOnChange({
    editor,
    key: ComboboxKey.TAG,
    trigger: '#',
  });
  const { maxSuggestions, setItems } = useComboboxStore(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ({ maxSuggestions, setItems }) => ({
      maxSuggestions,
      setItems,
    }),
    shallow
  );

  return useCallback(() => {
    const res = comboboxOnChange();
    if (!res) return false;

    const { search } = res;

    const items: IComboboxItem[] = data
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, maxSuggestions)
      .map((item) => ({
        key: item.value,
        text: item.name,
      }));

    setItems(items);

    return true;
  }, [comboboxOnChange, data, maxSuggestions, setItems]);
};
