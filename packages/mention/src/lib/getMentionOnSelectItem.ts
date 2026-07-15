import type { BaseEditor } from '@platejs/core';

import { BaseMentionPlugin } from './BaseMentionPlugin';
import type { TMentionItemBase } from './types';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = (editor: BaseEditor, item: TItem, search?: string) => void;

export const getMentionOnSelectItem =
  <
    TItem extends TMentionItemBase = TMentionItemBase,
  >(): MentionOnSelectItem<TItem> =>
  (editor, item, search = '') => {
    const { getOptions } = editor.plugin(BaseMentionPlugin);
    const { insertSpaceAfterMention } = getOptions();

    editor
      .plugin(BaseMentionPlugin)
      .update.insert({ key: item.key, search, value: item.text });

    // move the selection after the element
    editor.update.selection.move({ unit: 'offset' });

    const pathAbove = editor.read.nodes.block()?.[1];
    const selection = editor.read.selection();

    const isBlockEnd =
      selection &&
      pathAbove &&
      editor.read.points.isEnd(selection.anchor, pathAbove);

    if (isBlockEnd && insertSpaceAfterMention) {
      editor.update.text.insert(' ');
    }
  };
