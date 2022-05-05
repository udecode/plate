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
  moveSelection,
  PlatePluginKey,
  removeNodes,
  select,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './createMentionPlugin';
import { MentionNode, MentionNodeData, MentionPlugin } from './types';

export interface CreateMentionNode<TData extends Data> {
  (item: TComboboxItem<TData>): MentionNodeData;
}

export const getMentionOnSelectItem = <TData extends Data = NoData>({
  key = ELEMENT_MENTION,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const targetRange = comboboxSelectors.targetRange();
  if (!targetRange) return;

  const {
    type,
    options: { insertSpaceAfterMention, createMentionNode },
  } = getPlugin<MentionPlugin>(editor, key);

  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd =
    editor.selection &&
    pathAbove &&
    Editor.isEnd(editor, editor.selection.anchor, pathAbove);

  withoutNormalizing(editor, () => {
    // insert a space to fix the bug
    if (isBlockEnd) {
      insertText(editor, ' ');
    }

    select(editor, targetRange);

    HistoryEditor.withoutMerging(editor, () =>
      removeNodes(editor, {
        // TODO: replace any
        match: (node: any) => node.type === ELEMENT_MENTION_INPUT,
      })
    );

    insertNodes<MentionNode>(editor, {
      type,
      children: [{ text: '' }],
      ...createMentionNode!(item),
    });

    // move the selection after the element
    moveSelection(editor);

    // delete the inserted space
    if (isBlockEnd && !insertSpaceAfterMention) {
      deleteText(editor);
    }
  });
  return comboboxActions.reset();
};
