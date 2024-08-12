import {
  type PlateEditor,
  type PlatePluginKey,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertNodes,
  insertText,
  isEndPoint,
  moveSelection,
} from '@udecode/plate-common';

import type {
  MentionPluginOptions,
  TMentionElement,
  TMentionItemBase,
} from './types';

import { ELEMENT_MENTION } from './MentionPlugin';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = (editor: PlateEditor, item: TItem, search?: string) => void;

export const getMentionOnSelectItem =
  <TItem extends TMentionItemBase = TMentionItemBase>({
    key = ELEMENT_MENTION,
  }: PlatePluginKey = {}): MentionOnSelectItem<TItem> =>
  (editor, item, search = '') => {
    const { createMentionNode, insertSpaceAfterMention } =
      getPluginOptions<MentionPluginOptions>(editor as any, key);
    const type = getPluginType(editor, key);

    const props = createMentionNode!(item, search);

    insertNodes<TMentionElement>(editor, {
      children: [{ text: '' }],
      type,
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
