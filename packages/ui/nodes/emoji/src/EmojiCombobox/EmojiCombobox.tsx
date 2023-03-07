import React from 'react';
import { ComboboxOnSelectItem, Data, NoData } from '@udecode/plate-combobox';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-common';
import {
  EmojiItemData,
  EmojiPlugin,
  getEmojiOnSelectItem,
  KEY_EMOJI,
} from '@udecode/plate-emoji';
import { Combobox, ComboboxProps } from '@udecode/plate-ui-combobox';
import { EmojiComboboxItem } from './EmojiComboboxItem';

export interface TEmojiCombobox<TData extends Data = NoData>
  extends Partial<ComboboxProps<TData>> {
  pluginKey?: string;
  onSelectItem?: ComboboxOnSelectItem<TData> | null;
}

export const useEmojiCombobox = (pluginKey: string) => {
  const editor = usePlateEditorRef();
  const { trigger } = getPluginOptions<EmojiPlugin>(editor, pluginKey);

  const onSelectItem = getEmojiOnSelectItem({ key: pluginKey });

  return {
    trigger: trigger!,
    onSelectItem,
  };
};

export const EmojiCombobox = <TData extends EmojiItemData = EmojiItemData>({
  pluginKey = KEY_EMOJI,
  id = pluginKey,
  ...props
}: TEmojiCombobox<TData>) => {
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
};
