import {
  comboboxActions,
  ComboboxOnSelectItem,
  comboboxSelectors,
  Data,
  NoData,
  TComboboxItem,
} from '@udecode/plate-combobox';
import {
  deleteText,
  getBlockAbove,
  getPlugin,
  insertNodes,
  insertText,
  isEndPoint,
  moveSelection,
  PlatePluginKey,
  removeNodes,
  select,
  TNodeProps,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-core';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './createMentionPlugin';
import { MentionPlugin, TMentionElement } from './types';

export interface CreateMentionNode<TData extends Data> {
  (item: TComboboxItem<TData>): TNodeProps<TMentionElement>;
}

export const getMentionOnSelectItem = <TData extends Data = NoData>({
  key = ELEMENT_MENTION,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const targetRange = comboboxSelectors.targetRange();
  if (!targetRange) return;

  const {
    type,
    options: { insertSpaceAfterMention, createMentionNode },
  } = getPlugin<MentionPlugin>(editor as any, key);

  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd =
    editor.selection &&
    pathAbove &&
    isEndPoint(editor, editor.selection.anchor, pathAbove);

  withoutNormalizing(editor, () => {
    // insert a space to fix the bug
    if (isBlockEnd) {
      insertText(editor, ' ');
    }

    select(editor, targetRange);

    withoutMergingHistory(editor, () =>
      removeNodes(editor, {
        match: (node) => node.type === ELEMENT_MENTION_INPUT,
      })
    );

    const props = createMentionNode!(item);

    insertNodes<TMentionElement>(editor, {
      type,
      children: [{ text: '' }],
      ...props,
    } as TMentionElement);

    // move the selection after the element
    moveSelection(editor);

    // delete the inserted space
    if (isBlockEnd && !insertSpaceAfterMention) {
      deleteText(editor);
    }
  });
  return comboboxActions.reset();
};
