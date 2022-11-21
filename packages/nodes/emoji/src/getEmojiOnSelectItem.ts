import { comboboxActions, ComboboxOnSelectItem } from '@udecode/plate-combobox';
import {
  deleteText,
  getPlugin,
  insertText,
  moveSelection,
  PlatePluginKey,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-core';
import { ELEMENT_EMOJI } from './constants';
import { EmojiItemData, EmojiPluginOptions } from './types';

export const getEmojiOnSelectItem = <
  TData extends EmojiItemData = EmojiItemData
>({
  key = ELEMENT_EMOJI,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const {
    options: { createEmoji, emojiTriggeringController },
  } = getPlugin<EmojiPluginOptions>(editor as any, key);

  withoutNormalizing(editor, () => {
    // console.log('item', item);
    // console.log('EC ==>', JSON.stringify(emojiTriggeringController, null, 2));

    withoutMergingHistory(editor, () =>
      deleteText(editor, {
        distance: emojiTriggeringController.getTextSize(),
        reverse: true,
      })
    );
    emojiTriggeringController.reset();

    const value = createEmoji(item);
    insertText(editor, value);

    // move the selection after the element
    moveSelection(editor, { unit: 'offset' });
  });

  return comboboxActions.reset();
};
