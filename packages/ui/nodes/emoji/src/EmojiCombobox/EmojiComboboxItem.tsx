import React from 'react';
import { EmojiItemData } from '@udecode/plate-emoji';
import { ComboboxItemProps } from '@udecode/plate-ui-combobox';

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
