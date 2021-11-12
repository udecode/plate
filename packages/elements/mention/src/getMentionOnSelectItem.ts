import {
  ComboboxOnSelectItem,
  comboboxStore,
  Data,
  NoData,
  TComboboxItem,
} from '@udecode/plate-combobox';
import { getBlockAbove, insertNodes } from '@udecode/plate-common';
import { getPlugin, PlatePluginKey } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './defaults';
import { MentionNode, MentionNodeData, MentionPluginOptions } from './types';

export interface CreateMentionNode<TData extends Data> {
  (item: TComboboxItem<TData>): MentionNodeData;
}

export const getMentionOnSelectItem = <TData extends Data = NoData>({
  key = ELEMENT_MENTION,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const targetRange = comboboxStore.get.targetRange();
  if (!targetRange) return;

  const { type, insertSpaceAfterMention, createMentionNode } = getPlugin<
    Required<MentionPluginOptions>
  >(editor, key);

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

    // select the text and insert the element
    Transforms.select(editor, targetRange);

    Transforms.removeNodes(editor, {
      // TODO: replace any
      match: (node: any) => node.type === ELEMENT_MENTION_INPUT,
    });

    insertNodes<MentionNode>(editor, {
      type,
      children: [{ text: '' }],
      ...createMentionNode(item),
    });
    // move the selection after the element
    Transforms.move(editor);

    // delete the inserted space
    if (isBlockEnd && !insertSpaceAfterMention) {
      Transforms.delete(editor);
    }
  });
  return comboboxStore.set.reset();
};
