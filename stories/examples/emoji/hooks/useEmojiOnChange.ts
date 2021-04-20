import { useCallback } from 'react';
import { TEditor } from '@udecode/slate-plugins-core';
import { BaseEmoji, emojiIndex } from 'emoji-mart';
import shallow from 'zustand/shallow';
import { IComboboxItem } from '../../combobox/components/Combobox.types';
import { useComboboxOnChange } from '../../combobox/hooks/useComboboxOnChange';
import { ComboboxKey, useComboboxStore } from '../../combobox/useComboboxStore';

export const useEmojiOnChange = (editor: TEditor) => {
  const comboboxOnChange = useComboboxOnChange({
    editor,
    key: ComboboxKey.EMOJI,
    trigger: ':',
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

    const items: IComboboxItem[] = ((emojiIndex.search(search.toLowerCase()) ??
      []) as BaseEmoji[]) // cast to base emoji to access native type
      // custom emojis are images but we don't support those yet
      .slice(0, maxSuggestions)
      .map((item) => {
        return {
          key: item.id,
          text: `${item.native} ${item.colons}`,
          data: item,
        };
      });

    setItems(items);

    return true;
  }, [comboboxOnChange, maxSuggestions, setItems]);
};
