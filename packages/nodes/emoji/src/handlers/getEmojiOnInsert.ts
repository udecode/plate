import { ComboboxOnSelectItem } from '@udecode/plate-combobox';
import {
  focusEditor,
  getPlugin,
  insertText,
  PlatePluginKey,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_EMOJI } from '../constants';
import { EmojiItemData, EmojiPlugin } from '../types';

export const getEmojiOnInsert = <TData extends EmojiItemData = EmojiItemData>({
  key = KEY_EMOJI,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const {
    options: { createEmoji },
  } = getPlugin<EmojiPlugin>(editor as any, key);

  withoutNormalizing(editor, () => {
    focusEditor(editor);

    const value = createEmoji!(item);
    insertText(editor, value);
  });
};
