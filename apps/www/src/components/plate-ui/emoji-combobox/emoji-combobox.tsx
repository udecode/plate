import React from 'react';
import {
  EmojiItemData,
  KEY_EMOJI,
  TEmojiCombobox,
  useEmojiComboboxState,
} from '@udecode/plate-emoji';
import { EmojiComboboxItem } from './emoji-combobox-item';

import { Combobox } from '@/components/plate-ui/combobox/combobox';

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
