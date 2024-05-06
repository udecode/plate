import type { ComboboxOnSelectItem } from '@udecode/plate-combobox';

import { focusEditor } from '@udecode/plate-common';
import {
  type PlatePluginKey,
  getPlugin,
  insertText,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { EmojiItemData, EmojiPlugin } from '../types';

import { KEY_EMOJI } from '../constants';

export const getEmojiOnInsert =
  <TData extends EmojiItemData = EmojiItemData>({
    key = KEY_EMOJI,
  }: PlatePluginKey = {}): ComboboxOnSelectItem<TData> =>
  (editor, item) => {
    const {
      options: { createEmoji },
    } = getPlugin<EmojiPlugin>(editor as any, key);

    withoutNormalizing(editor, () => {
      focusEditor(editor);

      const value = createEmoji!(item);
      insertText(editor, value);
    });
  };
