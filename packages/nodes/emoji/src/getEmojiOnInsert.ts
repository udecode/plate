import { ComboboxOnSelectItem } from '@udecode/plate-combobox';
import {
  getPlugin,
  insertText,
  PlatePluginKey,
  withoutNormalizing,
} from '@udecode/plate-core';
import { ELEMENT_EMOJI } from './constants';
import { EmojiItemData, EmojiPlugin } from './types';

export const getEmojiOnInsert = <TData extends EmojiItemData = EmojiItemData>({
  key = ELEMENT_EMOJI,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const {
    options: { createEmoji },
  } = getPlugin<EmojiPlugin>(editor as any, key);

  withoutNormalizing(editor, () => {
    const value = createEmoji!(item);
    insertText(editor, value);
  });
};
