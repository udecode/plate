import React from 'react';
import { EmojiItemData, KEY_EMOJI } from '@udecode/plate-emoji';
import { EmojiComboboxItem } from './EmojiComboboxItem';

import { TEmojiCombobox, useEmojiCombobox } from '@/lib/@/useEmojiCombobox';
import { Combobox } from '@/plate/aui/combobox';

export function EmojiCombobox<TData extends EmojiItemData = EmojiItemData>({
  pluginKey = KEY_EMOJI,
  id = pluginKey,
  ...props
}: TEmojiCombobox<TData>) {
  const { trigger, onSelectItem } = useEmojiCombobox(pluginKey);

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
