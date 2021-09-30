import { comboboxStore } from '@udecode/plate-combobox';
import { getBlockAbove, insertNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { IComboboxItem } from '../../../ui/combobox/src/components/Combobox.types';
import { ELEMENT_MENTION } from './defaults';
import { MentionNodeData } from './types';

export type ComboboxOnSelectItem = (
  editor: SPEditor,
  item: IComboboxItem
) => any;

export const getMentionOnSelectItem = (): ComboboxOnSelectItem => (
  editor,
  item
) => {
  const targetRange = comboboxStore.get.targetRange();
  if (!targetRange) return;

  const type = getPlatePluginType(editor, ELEMENT_MENTION);
  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd =
    editor.selection &&
    pathAbove &&
    Editor.isEnd(editor, editor.selection.anchor, pathAbove);

  // insert a space to fix the bug
  if (isBlockEnd) {
    Transforms.insertText(editor, ' ');
  }

  // select the tag text and insert the tag element
  Transforms.select(editor, targetRange);
  insertNodes<TElement<MentionNodeData>>(editor, {
    type,
    children: [{ text: '' }],
    value: item.text,
  });
  // move the selection after the tag element
  Transforms.move(editor);

  // delete the inserted space
  if (isBlockEnd) {
    Transforms.delete(editor);
  }

  return comboboxStore.set.reset();
};
