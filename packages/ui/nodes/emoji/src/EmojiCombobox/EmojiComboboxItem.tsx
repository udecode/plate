import React from 'react';
import { TComboboxItem } from '@udecode/plate-combobox';
import { EmojiItemData } from '@udecode/plate-emoji';

export const EmojiComboboxItem = ({
  item,
}: TComboboxItem<EmojiItemData>): JSX.Element => {
  return (
    <div>
      {item.data.emoji} :{item.data.id}:
    </div>
  );
};
