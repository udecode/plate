import React from 'react';
import { ComboboxItemProps } from '@udecode/plate-combobox';
import { EmojiItemData } from '@udecode/plate-emoji';

export function EmojiComboboxItem({
  item,
}: ComboboxItemProps<EmojiItemData>): JSX.Element {
  const {
    data: { id, emoji },
  } = item;

  return (
    <div>
      {emoji} :{id}:
    </div>
  );
}
