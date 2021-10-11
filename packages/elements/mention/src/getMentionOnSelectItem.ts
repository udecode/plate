import {
  ComboboxItemData,
  ComboboxOnSelectItem,
  comboboxStore,
} from '@udecode/plate-combobox';
import { getBlockAbove, insertNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlatePluginKey,
  TElement,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_MENTION } from './defaults';
// FIXME: Cannot figure out the TS for this to work with insertNodes
// import { MentionNodeData } from './types';

export interface CreateMentionNode {
  (item: ComboboxItemData): Record<string, unknown>;
}

export const getMentionOnSelectItem = ({
  pluginKey = ELEMENT_MENTION,
  createMentionNode = (item) => ({ value: item.text }),
  insertSpaceAfterMention,
}: {
  createMentionNode?: CreateMentionNode;
  insertSpaceAfterMention?: boolean;
} & PlatePluginKey): ComboboxOnSelectItem => (editor, item) => {
  const targetRange = comboboxStore.get.targetRange();
  if (!targetRange) return;

  const type = getPlatePluginType(editor, pluginKey);
  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd =
    editor.selection &&
    pathAbove &&
    Editor.isEnd(editor, editor.selection.anchor, pathAbove);

  // insert a space to fix the bug
  if (isBlockEnd) {
    Transforms.insertText(editor, ' ');
  }

  // select the text and insert the element
  Transforms.select(editor, targetRange);
  insertNodes<TElement>(editor, {
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

  return comboboxStore.set.reset();
};
