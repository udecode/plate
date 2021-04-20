import * as React from 'react';
import { Combobox } from '../../combobox/components/Combobox';
import { ComboboxKey, useComboboxStore } from '../../combobox/useComboboxStore';
import { useEmojiOnSelectItem } from '../hooks/useEmojiOnSelectItem';
import { EmojiComboboxItem } from './EmojiComboboxItem';

export const EmojiComboBoxComponent = () => {
  const onSelectItem = useEmojiOnSelectItem();

  return (
    <Combobox onSelectItem={onSelectItem} onRenderItem={EmojiComboboxItem} />
  );
};

export const EmojiCombobox = () => {
  const key = useComboboxStore((state) => state.key);

  return (
    <div style={key !== ComboboxKey.EMOJI ? { display: 'none' } : {}}>
      <EmojiComboBoxComponent />
    </div>
  );
};
