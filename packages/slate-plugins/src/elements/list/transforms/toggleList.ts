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

    const nodes = Editor.nodes(editor, {
      match: node => node.type === PARAGRAPH,
    });

    const listItem = { type: ListType.LIST_ITEM, children: [] };
    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, { at: path });
    }
  }
};
