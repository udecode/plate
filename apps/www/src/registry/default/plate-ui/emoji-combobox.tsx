import React from 'react';

import type { ComboboxItemProps } from '@udecode/plate-combobox';

import {
  type EmojiItemData,
  KEY_EMOJI,
  type TEmojiCombobox,
  useEmojiComboboxState,
} from '@udecode/plate-emoji';

import { Combobox } from './combobox';

export function EmojiComboboxItem({ item }: ComboboxItemProps<EmojiItemData>) {
  const {
    data: { emoji, id },
  } = item;

  return (
    <div>
      {emoji} :{id}:
    </div>
  );
}

export function EmojiCombobox({
  pluginKey = KEY_EMOJI,
  id = pluginKey,
  ...props
}: TEmojiCombobox) {
  const { onSelectItem, trigger } = useEmojiComboboxState({ pluginKey });

  return (
    <Combobox
      controlled
      id={id}
      onRenderItem={EmojiComboboxItem}
      onSelectItem={onSelectItem as any}
      trigger={trigger}
      {...props}
    />
  );
}
