import { Editor, Transforms } from 'slate';
import { isBlockActive, PARAGRAPH } from 'slate-plugins';
import { ListType } from '../types';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);

  unwrapList(editor);

  Transforms.setNodes(editor, {
    type: isActive ? PARAGRAPH : ListType.LIST_ITEM,
  });

  if (!isActive) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
