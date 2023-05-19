import { comboboxActions, ComboboxOnSelectItem } from '@udecode/plate-combobox';
import {
  deleteText,
  getPlugin,
  insertText,
  PlatePluginKey,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_EMOJI } from '../constants';
import { EmojiItemData, EmojiPlugin } from '../types';

export const getEmojiOnSelectItem =
  <TData extends EmojiItemData = EmojiItemData>({
    key = KEY_EMOJI,
  }: PlatePluginKey = {}): ComboboxOnSelectItem<TData> =>
  (editor, item) => {
    const {
      options: { createEmoji, emojiTriggeringController },
    } = getPlugin<EmojiPlugin>(editor as any, key);

    withoutNormalizing(editor, () => {
      withoutMergingHistory(editor, () =>
        deleteText(editor, {
          distance: emojiTriggeringController!.getTextSize(),
          reverse: true,
        })
      );
      emojiTriggeringController!.reset();

      const value = createEmoji!(item);
      insertText(editor, value);
    });

    return comboboxActions.reset();
  };
