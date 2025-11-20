import { type SlateEditor, getEditorPlugin, KEYS } from 'platejs';

import type { MentionConfig } from './BaseMentionPlugin';
import type { TMentionItemBase } from './types';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = (editor: SlateEditor, item: TItem, search?: string) => void;

export const getMentionOnSelectItem =
  <TItem extends TMentionItemBase = TMentionItemBase>({
    key = KEYS.mention,
  }: {
    key?: string;
  } = {}): MentionOnSelectItem<TItem> =>
  (editor, item, search = '') => {
    const { getOptions, tf } = getEditorPlugin<MentionConfig>(editor, {
      key: key as any,
    });
    const { insertSpaceAfterMention } = getOptions();

    tf.insert.mention({ key: item.key, search, value: item.text });

    // move the selection after the element
    editor.tf.move({ unit: 'offset' });

    const pathAbove = editor.api.block()?.[1];

    const isBlockEnd =
      editor.selection &&
      pathAbove &&
      editor.api.isEnd(editor.selection.anchor, pathAbove);

    if (isBlockEnd && insertSpaceAfterMention) {
      editor.tf.insertText(' ');
    }
  };
