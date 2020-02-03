import { PARAGRAPH } from 'elements/paragraph';
import { isBlockActive } from 'elements/queries';
import { Editor, Transforms } from 'slate';
import { ListType } from '../types';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: Editor, listType: string) => {
  const isActive = isBlockActive(editor, listType);

  unwrapList(editor);

  Transforms.setNodes(editor, {
    type: PARAGRAPH,
  });

  if (!isActive) {
    const list = { type: listType, children: [] };
    Transforms.wrapNodes(editor, list);

    const listItem = { type: ListType.LIST_ITEM, children: [] };
    Transforms.wrapNodes(editor, listItem);
  }
};
