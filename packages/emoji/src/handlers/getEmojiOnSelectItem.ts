import {
  type ComboboxOnSelectItem,
  comboboxActions,
} from '@udecode/plate-combobox';
import {
  type PlatePluginKey,
  deleteText,
  getPlugin,
  insertText,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { EmojiItemData, EmojiPlugin } from '../types';

import { KEY_EMOJI } from '../constants';

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
          distance: emojiTriggeringController!
            .setIsTriggering(false)
            .getTextSize(),
          reverse: true,
        })
      );

      const value = createEmoji!(item);
      insertText(editor, value);
    });

    return comboboxActions.reset();
  };
