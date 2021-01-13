import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { isFirstChild } from '../../../common/queries/isFirstChild';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { hasListChild } from '../queries/hasListChild';
import { isListNested } from '../queries/isListNested';
import { ListOptions } from '../types';

/**
 * If the list is not nested and
 * if the list has one child and
 * if there is a sublist in `listItem` and
 * if `listItem` is the first child of `list`
 */
export const removeFirstListItem = (
  editor: Editor,
  {
    list,
    listItem,
  }: {
    list: NodeEntry<Ancestor>;
    listItem: NodeEntry<Ancestor>;
  },
  options?: ListOptions
) => {
  const [listNode, listPath] = list;
  const [listItemNode, listItemPath] = listItem;

  if (
    !isListNested(editor, listPath, options) &&
    listNode.children.length <= 1 &&
    hasListChild(listItemNode) &&
    isFirstChild(listItemPath)
  ) {
    // move all children to the container
    moveChildren(editor, {
      at: [listItemNode, listItemPath],
      to: Path.next(listPath),
    });
    Transforms.removeNodes(editor, { at: listPath });
    return true;
  }

  return false;
};
