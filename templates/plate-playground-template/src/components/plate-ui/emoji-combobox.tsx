import React from 'react';
import { ComboboxItemProps } from '@udecode/plate-combobox';
import {
  EmojiItemData,
  KEY_EMOJI,
  TEmojiCombobox,
  useEmojiComboboxState,
} from '@udecode/plate-emoji';

import { Combobox } from './combobox';

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

export function EmojiCombobox<TData extends EmojiItemData = EmojiItemData>({
  pluginKey = KEY_EMOJI,
  id = pluginKey,
  ...props
}: TEmojiCombobox<TData>) {
  const { trigger, onSelectItem } = useEmojiComboboxState({ pluginKey });

  return (
    <Combobox
      id={id}
      trigger={trigger}
      controlled
      onSelectItem={onSelectItem}
      onRenderItem={EmojiComboboxItem}
      {...props}
    />
  );
}
