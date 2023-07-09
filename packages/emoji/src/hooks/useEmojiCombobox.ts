import {
  ComboboxOnSelectItem,
  ComboboxProps,
  Data,
  NoData,
} from '@udecode/plate-combobox';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-common';

import { EmojiPlugin, getEmojiOnSelectItem } from '../index';

export interface TEmojiCombobox<TData extends Data = NoData>
  extends Partial<ComboboxProps<TData>> {
  pluginKey?: string;
  onSelectItem?: ComboboxOnSelectItem<TData> | null;
}

export const useEmojiComboboxState = ({ pluginKey }: { pluginKey: string }) => {
  const editor = usePlateEditorRef();
  const { trigger } = getPluginOptions<EmojiPlugin>(editor, pluginKey);

  const onSelectItem = getEmojiOnSelectItem({ key: pluginKey });

  return {
    trigger: trigger!,
    onSelectItem,
  };
};
