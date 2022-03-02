import {
  comboboxActions,
  ComboboxOnSelectItem,
  comboboxSelectors,
  Data,
  NoData,
  TComboboxItem,
} from '@udecode/plate-combobox';
import {
  getBlockAbove,
  getPlugin,
  insertNodes,
  PlatePluginKey,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
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

  Editor.withoutNormalizing(editor, () => {
    // insert a space to fix the bug
    if (isBlockEnd) {
      Transforms.insertText(editor, ' ');
    }

    // Create a new undo stack with the selection set at target range regardless
    // of current state. Both are important for undo, without either undo will
    // crash. Transforms.select will not always set the selection, so we went for the
    // raw op. The error appears to only appear in slate-react, not in headless.
    HistoryEditor.withoutMerging(editor, () =>
      editor.apply({
        type: 'set_selection',
        properties: editor.selection,
        newProperties: targetRange,
      })
    );

    Transforms.removeNodes(editor, {
      // TODO: replace any
      match: (node: any) => node.type === ELEMENT_MENTION_INPUT,
    });

    insertNodes<MentionNode>(editor, {
      type: type!,
      children: [{ text: '' }],
      ...createMentionNode!(item),
    });
    // move the selection after the element
    Transforms.move(editor);

    // delete the inserted space
    if (isBlockEnd && !insertSpaceAfterMention) {
      Transforms.delete(editor);
    }
  });
  return comboboxActions.reset();
};
