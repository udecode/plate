import type {
  ComboboxOnSelectItem,
  ComboboxProps,
  Data,
  NoData,
} from '@udecode/plate-combobox';

import { useEditorRef } from '@udecode/plate-common';
import { getPluginOptions } from '@udecode/plate-common/server';

import { type EmojiPlugin, getEmojiOnSelectItem } from '../index';

export interface TEmojiCombobox<TData extends Data = NoData>
  extends Partial<ComboboxProps<TData>> {
  onSelectItem?: ComboboxOnSelectItem<TData> | null;
  pluginKey?: string;
}

export const useEmojiComboboxState = ({ pluginKey }: { pluginKey: string }) => {
  const editor = useEditorRef();
  const { trigger } = getPluginOptions<EmojiPlugin>(editor, pluginKey);

  const onSelectItem = getEmojiOnSelectItem({ key: pluginKey });

  return {
    onSelectItem,
    trigger: trigger!,
  };
};
