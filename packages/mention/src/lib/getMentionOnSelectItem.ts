import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import type { TMentionItemBase } from './types';

import { type MentionConfig, BaseMentionPlugin } from './BaseMentionPlugin';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = (editor: SlateEditor, item: TItem, search?: string) => void;

export const getMentionOnSelectItem =
  <TItem extends TMentionItemBase = TMentionItemBase>({
    key = BaseMentionPlugin.key,
  }: { key?: string } = {}): MentionOnSelectItem<TItem> =>
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
