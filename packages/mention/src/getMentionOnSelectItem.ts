import {
  getBlockAbove,
  getPlugin,
  insertNodes,
  insertText,
  isEndPoint,
  moveSelection,
  PlateEditor,
  PlatePluginKey,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_MENTION } from './createMentionPlugin';
import { MentionPlugin, TMentionElement, TMentionItemBase } from './types';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = <V extends Value>(
  editor: PlateEditor<V>,
  item: TItem,
  search?: string
) => void;

export const getMentionOnSelectItem =
  <TItem extends TMentionItemBase = TMentionItemBase>({
    key = ELEMENT_MENTION,
  }: PlatePluginKey = {}): MentionOnSelectItem<TItem> =>
  (editor, item, search = '') => {
    const {
      type,
      options: { insertSpaceAfterMention, createMentionNode },
    } = getPlugin<MentionPlugin>(editor as any, key);

    const props = createMentionNode!(item, search);

    insertNodes<TMentionElement>(editor, {
      type,
      children: [{ text: '' }],
      ...props,
    } as TMentionElement);

    // move the selection after the element
    moveSelection(editor, { unit: 'offset' });

    const pathAbove = getBlockAbove(editor)?.[1];

    const isBlockEnd =
      editor.selection &&
      pathAbove &&
      isEndPoint(editor, editor.selection.anchor, pathAbove);

    if (isBlockEnd && insertSpaceAfterMention) {
      insertText(editor, ' ');
    }
  };
